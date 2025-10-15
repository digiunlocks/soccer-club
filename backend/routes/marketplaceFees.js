const express = require('express');
const router = express.Router();
const MarketplaceFee = require('../models/MarketplaceFee');
const MarketplacePayment = require('../models/MarketplacePayment');
const MarketplaceItem = require('../models/MarketplaceItem');
const authenticateToken = require('../middleware/auth');
const { superAdminAuth } = require('./auth');

// Get current marketplace fees (public)
router.get('/current', async (req, res) => {
  try {
    const fees = await MarketplaceFee.getCurrentFees();
    
    if (!fees) {
      return res.status(404).json({ message: 'No fee configuration found' });
    }
    
    res.json({
      success: true,
      fees: {
        postingFee: fees.postingFee,
        extensionFee: fees.extensionFee,
        featuredFee: fees.featuredFee,
        premiumFee: fees.premiumFee,
        feeType: fees.feeType,
        defaultExpirationDays: fees.defaultExpirationDays,
        extensionDays: fees.extensionDays,
        maxExtensions: fees.maxExtensions,
        freePostingLimit: fees.freePostingLimit,
        freeExtensionLimit: fees.freeExtensionLimit,
        currency: fees.currency,
        isActive: fees.isActive
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace fees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get fee configuration for admin (super admin only)
router.get('/admin/config', superAdminAuth, async (req, res) => {
  try {
    const fees = await MarketplaceFee.getCurrentFees();
    
    if (!fees) {
      return res.status(404).json({ message: 'No fee configuration found' });
    }
    
    res.json({
      success: true,
      fees
    });
  } catch (error) {
    console.error('Error fetching fee configuration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update fee configuration (super admin only)
router.put('/admin/config', superAdminAuth, async (req, res) => {
  try {
    const {
      postingFee,
      extensionFee,
      featuredFee,
      premiumFee,
      feeType,
      defaultExpirationDays,
      extensionDays,
      maxExtensions,
      freePostingLimit,
      freeExtensionLimit,
      currency,
      isActive
    } = req.body;
    
    // Validate required fields
    if (postingFee === undefined || extensionFee === undefined) {
      return res.status(400).json({ message: 'Posting fee and extension fee are required' });
    }
    
    // Create new fee configuration
    const newFees = await MarketplaceFee.createNewFees({
      postingFee,
      extensionFee,
      featuredFee: featuredFee || 0,
      premiumFee: premiumFee || 0,
      feeType: feeType || 'fixed',
      defaultExpirationDays: defaultExpirationDays || 90,
      extensionDays: extensionDays || 30,
      maxExtensions: maxExtensions || 3,
      freePostingLimit: freePostingLimit || 3,
      freeExtensionLimit: freeExtensionLimit || 1,
      currency: currency || 'USD',
      isActive: isActive !== undefined ? isActive : true
    }, req.user.id);
    
    res.json({
      success: true,
      message: 'Fee configuration updated successfully',
      fees: newFees
    });
  } catch (error) {
    console.error('Error updating fee configuration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Calculate posting fee for user
router.post('/calculate/posting', authenticateToken, async (req, res) => {
  try {
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
    
    res.json({
      success: true,
      postingFee,
      userPostCount,
      freePostingLimit: fees.freePostingLimit,
      isFree: postingFee === 0
    });
  } catch (error) {
    console.error('Error calculating posting fee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Calculate extension fee for user
router.post('/calculate/extension', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
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
    
    res.json({
      success: true,
      extensionFee,
      userExtensionCount,
      freeExtensionLimit: fees.freeExtensionLimit,
      isFree: extensionFee === 0,
      extensionDays: fees.extensionDays,
      currentExtensions: item.extensionCount,
      maxExtensions: fees.maxExtensions,
      daysUntilExpiration: item.getDaysUntilExpiration()
    });
  } catch (error) {
    console.error('Error calculating extension fee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's payment history
router.get('/payments/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const payments = await MarketplacePayment.getUserPayments(req.user.id, parseInt(limit), parseInt(skip));
    const totalPayments = await MarketplacePayment.countDocuments({ user: req.user.id });
    
    res.json({
      success: true,
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPayments / limit),
        totalPayments,
        hasNext: page * limit < totalPayments,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get payment statistics for admin (super admin only)
router.get('/admin/payments/stats', superAdminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    }
    
    const stats = await MarketplacePayment.getPaymentStats(start, end);
    
    res.json({
      success: true,
      stats: stats[0] || {
        totalPayments: 0,
        totalAmount: 0,
        completedPayments: 0,
        completedAmount: 0,
        failedPayments: 0,
        refundedPayments: 0,
        refundedAmount: 0
      }
    });
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get payments by type for admin (super admin only)
router.get('/admin/payments/by-type/:type', superAdminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    const payments = await MarketplacePayment.getPaymentsByType(type, start, end)
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const totalPayments = await MarketplacePayment.countDocuments({
      paymentType: type,
      ...(start && end && { createdAt: { $gte: start, $lte: end } })
    });
    
    res.json({
      success: true,
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPayments / limit),
        totalPayments,
        hasNext: page * limit < totalPayments,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching payments by type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
