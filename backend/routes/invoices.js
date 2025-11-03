const express = require('express');
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');
const { sendInvoiceEmail, sendPaymentReminder } = require('../services/invoiceEmailService');
const FinanceIntegrationService = require('../services/financeIntegrationService');
const router = express.Router();

// GET /api/invoices - Get all invoices with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      type = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { createdBy: req.user._id };
    
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (type) filter.invoiceType = type;
    
    if (dateFrom || dateTo) {
      filter.issueDate = {};
      if (dateFrom) filter.issueDate.$gte = new Date(dateFrom);
      if (dateTo) filter.issueDate.$lte = new Date(dateTo);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const invoices = await Invoice.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'username name email')
      .populate('updatedBy', 'username name email');

    const total = await Invoice.countDocuments(filter);

    res.json({
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// GET /api/invoices/stats - Get invoice statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Invoice.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          paidAmount: { $sum: '$paidAmount' },
          overdueAmount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$status', 'paid'] }, { $ne: ['$status', 'cancelled'] }, { $lt: ['$dueDate', new Date()] }] },
                '$total',
                0
              ]
            }
          },
          draftCount: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          sentCount: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          paidCount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          overdueCount: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } }
        }
      }
    ]);

    // Get monthly revenue for the last 12 months
    const monthlyRevenue = await Invoice.aggregate([
      { $match: { createdBy: userId, status: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' }
          },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      stats: stats[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        overdueAmount: 0,
        draftCount: 0,
        sentCount: 0,
        paidCount: 0,
        overdueCount: 0
      },
      monthlyRevenue
    });
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice statistics' });
  }
});

// GET /api/invoices/:id - Get specific invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('createdBy', 'username name email');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// POST /api/invoices - Create new invoice
router.post('/', auth, async (req, res) => {
  try {
    const invoiceData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Generate invoice number if not provided
    if (!invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = await Invoice.generateInvoiceNumber();
    }

    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discountAmount = invoiceData.discountType === 'percentage' 
      ? (subtotal * invoiceData.discount) / 100 
      : invoiceData.discount;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * invoiceData.taxRate) / 100;
    const total = afterDiscount + taxAmount;

    invoiceData.subtotal = subtotal;
    invoiceData.taxAmount = taxAmount;
    invoiceData.total = total;
    invoiceData.remainingAmount = total;

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Invoice number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  }
});

// PUT /api/invoices/:id - Update invoice
router.put('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Don't allow updates to paid invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Cannot update paid invoice' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    // Recalculate totals if items changed
    if (updateData.items) {
      const subtotal = updateData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      const discountAmount = updateData.discountType === 'percentage' 
        ? (subtotal * updateData.discount) / 100 
        : updateData.discount;
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * updateData.taxRate) / 100;
      const total = afterDiscount + taxAmount;

      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.total = total;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// POST /api/invoices/:id/send - Send invoice
router.post('/:id/send', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status === 'draft') {
      await invoice.sendInvoice();
      
      // Send email notification
      const emailResult = await sendInvoiceEmail(invoice);
      
      if (emailResult.success) {
        res.json({ message: 'Invoice sent successfully via email', invoice });
      } else {
        // Invoice was marked as sent but email failed
        res.json({ 
          message: 'Invoice marked as sent but email delivery failed', 
          invoice,
          emailError: emailResult.error 
        });
      }
    } else {
      res.status(400).json({ error: 'Invoice has already been sent' });
    }
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

// POST /api/invoices/:id/payment - Record payment
router.post('/:id/payment', auth, async (req, res) => {
  try {
    const { amount, method } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.paidAmount + amount > invoice.total) {
      return res.status(400).json({ error: 'Payment amount exceeds remaining balance' });
    }

    await invoice.recordPayment(amount, method);
    
    // 💰 Automatically record invoice payment in finance system
    try {
      const payment = { amount, method, paymentDate: new Date() };
      await FinanceIntegrationService.recordInvoicePayment(invoice, payment);
      console.log('💰 [Finance Integration] Invoice payment recorded in finance system');
    } catch (financeError) {
      console.error('⚠️  [Finance Integration] Failed to record invoice payment:', financeError.message);
    }
    
    res.json({ message: 'Payment recorded successfully', invoice });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// POST /api/invoices/:id/view - Mark invoice as viewed (for client)
router.post('/:id/view', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await invoice.markAsViewed();
    
    res.json({ message: 'Invoice marked as viewed' });
  } catch (error) {
    console.error('Mark as viewed error:', error);
    res.status(500).json({ error: 'Failed to mark invoice as viewed' });
  }
});

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Don't allow deletion of sent/paid invoices
    if (['sent', 'viewed', 'paid'].includes(invoice.status)) {
      return res.status(400).json({ error: 'Cannot delete sent or paid invoice' });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// POST /api/invoices/:id/reminder - Send payment reminder
router.post('/:id/reminder', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Cannot send reminder for paid invoice' });
    }

    const emailResult = await sendPaymentReminder(invoice);
    
    if (emailResult.success) {
      // Update reminder count and last reminder sent date
      invoice.reminderCount += 1;
      invoice.lastReminderSent = new Date();
      await invoice.save();
      
      res.json({ message: 'Payment reminder sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send payment reminder', details: emailResult.error });
    }
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ error: 'Failed to send payment reminder' });
  }
});

// GET /api/invoices/export/csv - Export invoices to CSV
router.get('/export/csv', auth, async (req, res) => {
  try {
    const { status, type, dateFrom, dateTo } = req.query;
    
    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    if (type) filter.invoiceType = type;
    if (dateFrom || dateTo) {
      filter.issueDate = {};
      if (dateFrom) filter.issueDate.$gte = new Date(dateFrom);
      if (dateTo) filter.issueDate.$lte = new Date(dateTo);
    }

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    
    // Generate CSV
    const csvHeader = 'Invoice Number,Client Name,Client Email,Type,Status,Issue Date,Due Date,Total,Paid Amount,Remaining Amount\n';
    const csvRows = invoices.map(invoice => 
      `"${invoice.invoiceNumber}","${invoice.clientName}","${invoice.clientEmail}","${invoice.invoiceType}","${invoice.status}","${invoice.issueDate.toISOString().split('T')[0]}","${invoice.dueDate.toISOString().split('T')[0]}","${invoice.total}","${invoice.paidAmount}","${invoice.remainingAmount}"`
    ).join('\n');
    
    const csv = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export invoices error:', error);
    res.status(500).json({ error: 'Failed to export invoices' });
  }
});

module.exports = router;
