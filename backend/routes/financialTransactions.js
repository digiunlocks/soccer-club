const express = require('express');
const router = express.Router();
const FinancialTransaction = require('../models/FinancialTransaction');
const { superAdminAuth } = require('./auth');

// GET all transactions (admin only)
router.get('/', superAdminAuth, async (req, res) => {
  try {
    const { type, category, status, startDate, endDate, limit = 50, page = 1 } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await FinancialTransaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username email');
    
    const total = await FinancialTransaction.countDocuments(query);
    
    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET transaction by ID
router.get('/:id', superAdminAuth, async (req, res) => {
  try {
    const transaction = await FinancialTransaction.findById(req.params.id)
      .populate('createdBy', 'username email');
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// GET summary statistics
router.get('/stats/summary', superAdminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await FinancialTransaction.getSummary(startDate, endDate);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary statistics' });
  }
});

// GET category breakdown
router.get('/stats/categories/:type', superAdminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const breakdown = await FinancialTransaction.getCategoryBreakdown(
      req.params.type,
      startDate,
      endDate
    );
    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
});

// CREATE new transaction
router.post('/', superAdminAuth, async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const transaction = new FinancialTransaction(transactionData);
    await transaction.save();
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// UPDATE transaction
router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      updatedBy: req.user._id
    };
    
    const transaction = await FinancialTransaction.findByIdAndUpdate(
      req.params.id,
      transactionData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email');
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE transaction
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    const transaction = await FinancialTransaction.findByIdAndDelete(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;

