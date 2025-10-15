const express = require('express');
const router = express.Router();
const MarketplaceFee = require('../models/MarketplaceFee');
const MarketplacePayment = require('../models/MarketplacePayment');
const MarketplaceItem = require('../models/MarketplaceItem');
const authenticateToken = require('../middleware/auth');
const { superAdminAuth } = require('./auth');

// Create payment for posting fee
router.post('/posting-fee', authenticateToken, async (req, res) => {
  try {
    const { itemId, paymentMethod } = req.body;
    
    if (!itemId || !paymentMethod) {
      return res.status(400).json({ message: 'Item ID and payment method are required' });
    }
    
    const fees = await MarketplaceFee.getCurrentFees();
    
    if (!fees) {
      return res.status(404).json({ message: 'No fee configuration found' });
    }
    
    // Get user's posting count for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const userPostCount = await MarketplaceItem.countDocuments({
      seller: req.user.id,
      createdAt: { $gte: startOfMonth }
    });
    
    const postingFee = fees.calculatePostingFee(req.user.id, userPostCount);
    
    if (postingFee === 0) {
      return res.status(400).json({ message: 'No posting fee required' });
    }
    
    // Create payment record
    const payment = new MarketplacePayment({
      user: req.user.id,
      item: itemId,
      amount: postingFee,
      currency: fees.currency,
      paymentType: 'posting_fee',
      paymentMethod,
      feeConfig: fees._id,
      description: `Posting fee for marketplace item`,
      metadata: {
        userPostCount,
        freePostingLimit: fees.freePostingLimit
      }
    });
    
    await payment.save();
    
    res.json({
      success: true,
      message: 'Payment created successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        expiresAt: payment.expiresAt
      }
    });
  } catch (error) {
    console.error('Error creating posting fee payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create payment for extension fee
router.post('/extension-fee', authenticateToken, async (req, res) => {
  try {
    const { itemId, paymentMethod } = req.body;
    
    if (!itemId || !paymentMethod) {
      return res.status(400).json({ message: 'Item ID and payment method are required' });
    }
    
    const fees = await MarketplaceFee.getCurrentFees();
    
    if (!fees) {
      return res.status(404).json({ message: 'No fee configuration found' });
    }
    
    const item = await MarketplaceItem.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only extend your own items' });
    }
    
    // Check if item can be extended
    if (!item.canBeExtended(fees.maxExtensions)) {
      return res.status(400).json({ 
        message: `Item cannot be extended. Maximum extensions (${fees.maxExtensions}) reached or item not approved.` 
      });
    }
    
    // Get user's extension count for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const userExtensionCount = await MarketplaceItem.countDocuments({
      seller: req.user.id,
      lastExtendedAt: { $gte: startOfMonth }
    });
    
    const extensionFee = fees.calculateExtensionFee(req.user.id, userExtensionCount);
    
    if (extensionFee === 0) {
      return res.status(400).json({ message: 'No extension fee required' });
    }
    
    // Create payment record
    const payment = new MarketplacePayment({
      user: req.user.id,
      item: itemId,
      amount: extensionFee,
      currency: fees.currency,
      paymentType: 'extension_fee',
      paymentMethod,
      feeConfig: fees._id,
      description: `Extension fee for marketplace item: ${item.title}`,
      metadata: {
        userExtensionCount,
        freeExtensionLimit: fees.freeExtensionLimit,
        extensionDays: fees.extensionDays,
        currentExtensions: item.extensionCount
      }
    });
    
    await payment.save();
    
    res.json({
      success: true,
      message: 'Payment created successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        expiresAt: payment.expiresAt
      }
    });
  } catch (error) {
    console.error('Error creating extension fee payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Process payment (simulate payment processing)
router.post('/process/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { externalPaymentId } = req.body;
    
    if (!externalPaymentId) {
      return res.status(400).json({ message: 'External payment ID is required' });
    }
    
    const payment = await MarketplacePayment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only process your own payments' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment is not in pending status' });
    }
    
    if (payment.isExpired) {
      return res.status(400).json({ message: 'Payment has expired' });
    }
    
    // Mark payment as completed
    await payment.markCompleted(externalPaymentId, req.user.id);
    
    // If this is an extension fee, extend the item
    if (payment.paymentType === 'extension_fee' && payment.item) {
      const fees = await MarketplaceFee.getCurrentFees();
      const item = await MarketplaceItem.findById(payment.item);
      
      if (item && fees) {
        await item.extendExpiration(fees.extensionDays, payment.amount);
      }
    }
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        processedAt: payment.processedAt
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel payment
router.post('/cancel/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await MarketplacePayment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only cancel your own payments' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment cannot be cancelled' });
    }
    
    payment.status = 'cancelled';
    await payment.save();
    
    res.json({
      success: true,
      message: 'Payment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get payment details
router.get('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await MarketplacePayment.findById(paymentId)
      .populate('item', 'title price')
      .populate('feeConfig', 'postingFee extensionFee featuredFee');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only view your own payments' });
    }
    
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Process refund (super admin only)
router.post('/admin/refund/:paymentId', superAdminAuth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { refundAmount, reason } = req.body;
    
    const payment = await MarketplacePayment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (!payment.isRefundable) {
      return res.status(400).json({ message: 'Payment cannot be refunded' });
    }
    
    await payment.processRefund(refundAmount, reason, req.user.id);
    
    res.json({
      success: true,
      message: 'Refund processed successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        refundedAt: payment.refundedAt,
        refundAmount: payment.refundAmount
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
