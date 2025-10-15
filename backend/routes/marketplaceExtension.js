const express = require('express');
const router = express.Router();
const MarketplaceItem = require('../models/MarketplaceItem');
const MarketplaceSettings = require('../models/MarketplaceSettings');
const Notification = require('../models/Notification');
const authenticateToken = require('../middleware/auth');

// Get items expiring soon for current user
router.get('/my-expiring-items', authenticateToken, async (req, res) => {
  try {
    const settings = await MarketplaceSettings.getSettings();
    const now = new Date();
    const warningDate = new Date(now.getTime() + (settings.expirationWarningDays * 24 * 60 * 60 * 1000));
    
    const items = await MarketplaceItem.find({
      seller: req.user.id,
      status: { $in: ['approved', 'expired'] },
      expiresAt: { $lte: warningDate }
    }).sort({ expiresAt: 1 });
    
    const itemsWithDetails = items.map(item => ({
      ...item.toObject(),
      daysRemaining: item.getDaysUntilExpiration(),
      canExtend: item.canBeExtended(settings.maxExtensionsAllowed),
      extensionPrice: settings.getExtensionPrice(item.category),
      extensionDays: settings.extensionDays
    }));
    
    res.json({ items: itemsWithDetails, settings });
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    res.status(500).json({ error: 'Failed to fetch expiring items' });
  }
});

// Extend an item
router.post('/extend/:itemId', authenticateToken, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if user owns the item
    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to extend this item' });
    }
    
    const settings = await MarketplaceSettings.getSettings();
    
    // Check if extensions are allowed
    if (!settings.allowExtensions) {
      return res.status(400).json({ error: 'Extensions are not currently allowed' });
    }
    
    // Check if item can be extended
    if (!item.canBeExtended(settings.maxExtensionsAllowed)) {
      return res.status(400).json({ 
        error: `Maximum extensions (${settings.maxExtensionsAllowed}) reached for this item` 
      });
    }
    
    // Calculate extension price
    const extensionPrice = settings.getExtensionPrice(item.category);
    const extensionDays = settings.extensionDays;
    
    // TODO: In a real app, process payment here
    // For now, we'll just extend the item
    
    // If item is expired, reactivate it
    if (item.status === 'expired') {
      item.status = 'approved';
    }
    
    await item.extendExpiration(extensionDays, extensionPrice);
    
    // Send notification
    await Notification.create({
      user: req.user.id,
      type: 'item_extended',
      title: `Your listing "${item.title}" has been extended`,
      message: `Your item has been extended for ${extensionDays} more days. It will now expire on ${item.expiresAt.toLocaleDateString()}.`,
      data: {
        itemId: item._id.toString(),
        itemTitle: item.title,
        newExpiresAt: item.expiresAt,
        extensionDays,
        extensionPrice,
        extensionCount: item.extensionCount
      }
    });
    
    res.json({ 
      message: 'Item extended successfully',
      item: {
        ...item.toObject(),
        daysRemaining: item.getDaysUntilExpiration()
      }
    });
  } catch (error) {
    console.error('Error extending item:', error);
    res.status(500).json({ error: 'Failed to extend item' });
  }
});

// Get extension info for an item
router.get('/extension-info/:itemId', authenticateToken, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if user owns the item
    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const settings = await MarketplaceSettings.getSettings();
    
    res.json({
      item: {
        id: item._id,
        title: item.title,
        category: item.category,
        expiresAt: item.expiresAt,
        daysRemaining: item.getDaysUntilExpiration(),
        extensionCount: item.extensionCount,
        status: item.status
      },
      extensionInfo: {
        allowExtensions: settings.allowExtensions,
        canExtend: item.canBeExtended(settings.maxExtensionsAllowed),
        extensionDays: settings.extensionDays,
        extensionPrice: settings.getExtensionPrice(item.category),
        maxExtensionsAllowed: settings.maxExtensionsAllowed,
        extensionsRemaining: Math.max(0, settings.maxExtensionsAllowed - item.extensionCount)
      }
    });
  } catch (error) {
    console.error('Error fetching extension info:', error);
    res.status(500).json({ error: 'Failed to fetch extension info' });
  }
});

module.exports = router;

