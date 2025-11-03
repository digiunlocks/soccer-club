const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { auth } = require('./auth');

// Get all payments (admin endpoint)
router.get('/all', auth, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1, paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    console.error('Error fetching all payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payment statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const payments = await Payment.find();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const completedPayments = payments.filter(p => p.status === 'completed');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const refundedPayments = payments.filter(p => p.status === 'refunded');
    const todayPayments = payments.filter(p => new Date(p.paymentDate || p.createdAt) >= today);
    const weekPayments = payments.filter(p => new Date(p.paymentDate || p.createdAt) >= weekAgo);
    const monthPayments = payments.filter(p => new Date(p.paymentDate || p.createdAt) >= monthAgo);

    const stats = {
      totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      completedPayments: completedPayments.length,
      pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      refundedAmount: refundedPayments.reduce((sum, p) => sum + p.amount, 0),
      todayRevenue: todayPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      todayCount: todayPayments.length,
      weekRevenue: weekPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      monthRevenue: monthPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      avgTransactionAmount: completedPayments.length > 0 ? completedPayments.reduce((sum, p) => sum + p.amount, 0) / completedPayments.length : 0,
      successRate: payments.length > 0 ? (completedPayments.length / payments.length) * 100 : 0,
      refundRate: completedPayments.length > 0 ? (refundedPayments.length / completedPayments.length) * 100 : 0
    };

    res.json(stats);
  } catch (err) {
    console.error('Error calculating stats:', err);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// Get all payments (optionally filter by status, method, donor name, card type, last4, user, or date range)
router.get('/', auth, async (req, res) => {
  const { status, method, name, cardType, cardLast4, user, startDate, endDate } = req.query;
  const filter = {};
  
  if (status) filter.status = status;
  if (method) filter.method = method;
  if (name) filter.donorName = { $regex: name, $options: 'i' };
  if (cardType) filter.cardType = { $regex: cardType, $options: 'i' };
  if (cardLast4) filter.cardLast4 = cardLast4;
  
  // Date range filtering
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      // Set end date to end of day
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endDateTime;
    }
  }
  
  if (user === 'me' && req.user && req.user.email) {
    filter.donorEmail = req.user.email;
  }
  
  try {
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payment analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    const payments = await Payment.find(filter);
    
    const analytics = {
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      totalPayments: payments.length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      refundedAmount: payments.reduce((sum, p) => sum + (p.totalRefunded || 0), 0),
      methodBreakdown: {},
      statusBreakdown: {},
      averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0
    };

    // Method breakdown
    const methods = ['paypal', 'zelle', 'venmo', 'cashapp', 'card'];
    methods.forEach(method => {
      analytics.methodBreakdown[method] = payments.filter(p => p.method === method).length;
    });

    // Status breakdown
    const statuses = ['completed', 'pending', 'refunded', 'failed', 'partial'];
    statuses.forEach(status => {
      analytics.statusBreakdown[status] = payments.filter(p => p.status === status).length;
    });

    // Monthly revenue (last 12 months)
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthRevenue = payments
        .filter(p => {
          const paymentDate = new Date(p.createdAt);
          return paymentDate.getMonth() === month.getMonth() && 
                 paymentDate.getFullYear() === month.getFullYear();
        })
        .reduce((sum, p) => sum + p.amount, 0);
      monthlyRevenue.push({ month: monthStr, revenue: monthRevenue });
    }
    
    analytics.monthlyRevenue = monthlyRevenue;

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Add sample payment data for testing
router.post('/sample-data', auth, async (req, res) => {
  try {
    const samplePayments = [
      {
        amount: 150.00,
        donorName: "John Smith",
        donorEmail: "john.smith@email.com",
        method: "paypal",
        status: "completed",
        transactionId: "PP-123456789",
        notes: "Season registration fee"
      },
      {
        amount: 75.50,
        donorName: "Sarah Johnson",
        donorEmail: "sarah.j@email.com",
        method: "card",
        status: "completed",
        transactionId: "CC-987654321",
        cardType: "Visa",
        cardLast4: "1234",
        notes: "Training session payment"
      },
      {
        amount: 200.00,
        donorName: "Mike Davis",
        donorEmail: "mike.davis@email.com",
        method: "zelle",
        status: "pending",
        notes: "Tournament registration"
      },
      {
        amount: 50.00,
        donorName: "Lisa Wilson",
        donorEmail: "lisa.w@email.com",
        method: "venmo",
        status: "completed",
        transactionId: "VM-456789123",
        notes: "Equipment fee"
      },
      {
        amount: 100.00,
        donorName: "David Brown",
        donorEmail: "david.brown@email.com",
        method: "card",
        status: "completed",
        transactionId: "CC-111222333",
        cardType: "MasterCard",
        cardLast4: "5678",
        notes: "Membership renewal"
      }
    ];

    const createdPayments = [];
    for (const paymentData of samplePayments) {
      const payment = new Payment(paymentData);
      await payment.save();
      createdPayments.push(payment);
    }

    res.status(201).json({ 
      message: 'Sample payment data created successfully', 
      count: createdPayments.length,
      payments: createdPayments 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a new payment (for manual entry or test)
router.post('/', auth, async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update an existing payment
router.put('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Issue a refund (partial or full, with log)
router.post('/:id/refund', auth, async (req, res) => {
  try {
    const { refundAmount, refundReason, refundMethod, refundNotes } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    
    // Validate payment can be refunded
    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }
    
    const amount = Number(refundAmount);
    if (!amount || amount <= 0 || amount > (payment.amount - (payment.totalRefunded || 0))) {
      return res.status(400).json({ error: 'Invalid refund amount' });
    }
    
    // Add refund log
    payment.refunds = payment.refunds || [];
    const refundType = amount === payment.amount ? 'full' : 'partial';
    payment.refunds.push({
      amount,
      reason: refundReason || '',
      refundMethod: refundMethod || 'original',
      notes: refundNotes || '',
      status: 'processed',
      admin: req.user.name || req.user.email,
      refundedAt: new Date(),
      refundType,
    });
    
    payment.totalRefunded = (payment.totalRefunded || 0) + amount;
    
    // Update payment status
    if (payment.totalRefunded === payment.amount) {
      payment.status = 'refunded';
      payment.refundedAt = new Date();
      payment.refundReason = refundReason || '';
    } else {
      payment.status = 'partial';
    }
    
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get refund history for a payment
router.get('/:id/refunds', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment.refunds || []);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update payment notes
router.put('/:id/notes', auth, async (req, res) => {
  try {
    const { notes } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id, 
      { notes }, 
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a payment (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 