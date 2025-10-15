const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const MarketplaceItem = require('../models/MarketplaceItem');
const User = require('../models/User');
const { auth: authenticateToken } = require('./auth');

// Create a new transaction (purchase)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { itemId, amount, paymentMethod, notes, meetingLocation, meetingDate, meetingTime } = req.body;
    
    // Get the item
    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if item is available
    if (item.status !== 'approved' || item.availability !== 'available') {
      return res.status(400).json({ message: 'Item is not available for purchase' });
    }
    
    // Check if user is not buying their own item
    if (item.author.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot purchase your own item' });
    }
    
    // Create transaction
    const transaction = new Transaction({
      buyer: req.user.id,
      seller: item.author,
      item: itemId,
      amount,
      paymentMethod,
      notes,
      meetingLocation,
      meetingDate,
      meetingTime,
      buyerContact: {
        phone: req.user.phone,
        email: req.user.email
      },
      sellerContact: {
        phone: item.contactInfo?.phone,
        email: item.contactInfo?.email
      }
    });
    
    await transaction.save();
    
    // Mark item as sold
    item.availability = 'sold';
    item.status = 'sold';
    await item.save();
    
    res.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's transactions (as buyer or seller)
router.get('/my-transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user.id }, { seller: req.user.id }]
    })
    .populate('buyer', 'username email')
    .populate('seller', 'username email')
    .populate('item', 'title price images')
    .sort({ transactionDate: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get completed transactions that can be reviewed
router.get('/reviewable', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      buyer: req.user.id,
      status: 'completed',
      $or: [
        { itemReviewed: false },
        { sellerReviewed: false }
      ]
    })
    .populate('seller', 'username email')
    .populate('item', 'title price images authorName')
    .sort({ completedDate: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching reviewable transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a transaction (mark as completed)
router.patch('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Only seller can mark as completed
    if (transaction.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only seller can complete transaction' });
    }
    
    transaction.status = 'completed';
    transaction.completedDate = new Date();
    await transaction.save();
    
    res.json(transaction);
  } catch (error) {
    console.error('Error completing transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a transaction
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Only buyer or seller can cancel
    if (transaction.buyer.toString() !== req.user.id && transaction.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this transaction' });
    }
    
    transaction.status = 'cancelled';
    await transaction.save();
    
    // Mark item as available again
    const item = await MarketplaceItem.findById(transaction.item);
    if (item) {
      item.availability = 'available';
      item.status = 'approved';
      await item.save();
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
