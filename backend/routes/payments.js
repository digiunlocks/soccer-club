const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { superAdminAuth } = require('./auth');
const FinanceIntegrationService = require('../services/financeIntegrationService');

// GET /api/payments - Get all payments (admin only, with filters)
router.get('/', superAdminAuth, async (req, res) => {
  try {
    const { 
      status, 
      paymentType, 
      paymentMethod,
      startDate, 
      endDate,
      search,
      limit = 50, 
      page = 1 
    } = req.query;
    
    const query = {};

    if (status) query.status = status;
    if (paymentType) query.paymentType = paymentType;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { payerName: { $regex: search, $options: 'i' } },
        { payerEmail: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .sort({ paymentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username email');

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// GET /api/payments/stats - Get payment statistics
router.get('/stats', superAdminAuth, async (req, res) => {
  try {
    const stats = await Payment.getPaymentStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

// GET /api/payments/:id - Get specific payment
router.get('/:id', superAdminAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('relatedUser', 'username email')
      .populate('relatedMembership')
      .populate('relatedEvent');
      
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// POST /api/payments - Create new payment (Admin only)
router.post('/', superAdminAuth, async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    // Generate transaction ID if not provided
    if (!paymentData.transactionId) {
      paymentData.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    
    const payment = new Payment(paymentData);
    await payment.save();
    
    // 💰 Automatically record in finance system if completed
    if (payment.status === 'completed') {
      try {
        // Create a finance transaction entry
        const financeData = {
          type: 'income',
          category: payment.paymentType,
          description: `Payment from ${payment.payerName} - ${payment.paymentType}`,
          amount: payment.amount,
          date: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          status: 'completed',
          referenceNumber: payment.transactionId,
          payer: payment.payerName,
          notes: `Automated entry from payment system. Payment ID: ${payment._id}`,
          createdBy: req.user._id
        };
        
        const FinancialTransaction = require('../models/FinancialTransaction');
        const financeTransaction = new FinancialTransaction(financeData);
        await financeTransaction.save();
        
        console.log('💰 [Payment Integration] Payment recorded in finance system');
      } catch (financeError) {
        console.error('⚠️  [Payment Integration] Failed to record in finance:', financeError.message);
      }
    }
    
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Transaction ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// PUT /api/payments/:id - Update payment (Admin only)
router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      updatedBy: req.user._id
    };
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      paymentData,
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// POST /api/payments/:id/refund - Process refund
router.post('/:id/refund', superAdminAuth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid refund amount' });
    }
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    await payment.processRefund(amount, reason, req.user._id);
    
    // Record refund in finance system as expense
    try {
      const FinancialTransaction = require('../models/FinancialTransaction');
      const refundTransaction = new FinancialTransaction({
        type: 'expense',
        category: 'Refunds',
        description: `Refund to ${payment.payerName} - ${payment.paymentType}`,
        amount: amount,
        date: new Date(),
        paymentMethod: payment.paymentMethod,
        status: 'completed',
        referenceNumber: `REFUND-${payment.transactionId}`,
        payee: payment.payerName,
        notes: `Refund for payment ${payment._id}. Reason: ${reason}`,
        createdBy: req.user._id
      });
      await refundTransaction.save();
      console.log('💰 [Payment Integration] Refund recorded in finance system');
    } catch (financeError) {
      console.error('⚠️  [Payment Integration] Failed to record refund:', financeError.message);
    }
    
    res.json({ message: 'Refund processed successfully', payment });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: error.message || 'Failed to process refund' });
  }
});

// DELETE /api/payments/:id - Delete payment (Admin only)
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

module.exports = router;

