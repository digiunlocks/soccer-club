const express = require('express');
const router = express.Router();
const { auth: authenticateToken, superAdminAuth } = require('./auth');
const MarketplaceFlag = require('../models/MarketplaceFlag');
const MarketplaceItem = require('../models/MarketplaceItem');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Flag an item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { itemId, reason, description } = req.body;
    
    if (!itemId || !reason) {
      return res.status(400).json({ message: 'Item ID and reason are required' });
    }
    
    // Check if item exists
    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user is trying to flag their own item
    if (item.author.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot flag your own item' });
    }
    
    // Check if user has already flagged this item
    const existingFlag = await MarketplaceFlag.findOne({
      item: itemId,
      reporter: req.user.id
    });
    
    if (existingFlag) {
      return res.status(400).json({ message: 'You have already flagged this item' });
    }
    
    const flag = new MarketplaceFlag({
      item: itemId,
      reporter: req.user.id,
      reason,
      description: description || ''
    });
    
    await flag.save();
    await flag.populate('item', 'title price images author');
    await flag.populate('reporter', 'username firstName lastName');
    
    // Increment flag count on the item
    await item.incrementFlagCount();
    
    // Check if item should be flagged for review (3+ flags)
    if (item.flagCount >= 3 && item.status === 'flagged_for_review') {
      // Notify all super admins about the flagged item
      const superAdmins = await User.find({ role: 'super_admin' });
      
      for (const admin of superAdmins) {
        await Notification.createNotification(
          admin._id,
          req.user.id,
          'item_flagged_for_review',
          'Item Flagged for Review',
          `Item "${item.title}" has been flagged ${item.flagCount} times and requires admin review.`,
          itemId,
          null,
          {
            itemTitle: item.title,
            flagCount: item.flagCount,
            reporterName: flag.reporter.username,
            reason: reason
          }
        );
      }
      
      console.log('🚨 Item flagged for review:', {
        itemId,
        title: item.title,
        flagCount: item.flagCount,
        notifiedAdmins: superAdmins.length
      });
    }
    
    console.log('🚩 Item flagged:', {
      itemId,
      reason,
      reporter: req.user.id,
      flagId: flag._id,
      newFlagCount: item.flagCount
    });
    
    res.status(201).json({ 
      message: 'Item flagged successfully',
      flag: flag,
      itemStatus: item.status,
      flagCount: item.flagCount
    });
  } catch (error) {
    console.error('Error flagging item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get flags for a specific item (admin only)
router.get('/item/:itemId', authenticateToken, superAdminAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const flags = await MarketplaceFlag.getFlagsForItem(itemId);
    res.json(flags);
  } catch (error) {
    console.error('Error fetching flags for item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pending flags (admin only)
router.get('/pending', authenticateToken, superAdminAuth, async (req, res) => {
  try {
    const flags = await MarketplaceFlag.getPendingFlags();
    res.json(flags);
  } catch (error) {
    console.error('Error fetching pending flags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's flags
router.get('/my-flags', authenticateToken, async (req, res) => {
  try {
    const flags = await MarketplaceFlag.getFlagsByUser(req.user.id);
    res.json(flags);
  } catch (error) {
    console.error('Error fetching user flags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Review a flag (admin only)
router.put('/:flagId/review', authenticateToken, superAdminAuth, async (req, res) => {
  try {
    const { flagId } = req.params;
    const { adminNotes } = req.body;
    
    const flag = await MarketplaceFlag.findById(flagId);
    if (!flag) {
      return res.status(404).json({ message: 'Flag not found' });
    }
    
    await flag.markAsReviewed(req.user.id, adminNotes);
    await flag.populate('item', 'title price images author');
    await flag.populate('reporter', 'username firstName lastName');
    await flag.populate('reviewedBy', 'username firstName lastName');
    
    res.json({ 
      message: 'Flag marked as reviewed',
      flag: flag
    });
  } catch (error) {
    console.error('Error reviewing flag:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resolve a flag (admin only)
router.put('/:flagId/resolve', authenticateToken, superAdminAuth, async (req, res) => {
  try {
    const { flagId } = req.params;
    const { adminNotes } = req.body;
    
    const flag = await MarketplaceFlag.findById(flagId);
    if (!flag) {
      return res.status(404).json({ message: 'Flag not found' });
    }
    
    await flag.resolve(req.user.id, adminNotes);
    await flag.populate('item', 'title price images author');
    await flag.populate('reporter', 'username firstName lastName');
    await flag.populate('reviewedBy', 'username firstName lastName');
    
    res.json({ 
      message: 'Flag resolved',
      flag: flag
    });
  } catch (error) {
    console.error('Error resolving flag:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dismiss a flag (admin only)
router.put('/:flagId/dismiss', authenticateToken, superAdminAuth, async (req, res) => {
  try {
    const { flagId } = req.params;
    const { adminNotes } = req.body;
    
    const flag = await MarketplaceFlag.findById(flagId);
    if (!flag) {
      return res.status(404).json({ message: 'Flag not found' });
    }
    
    await flag.dismiss(req.user.id, adminNotes);
    await flag.populate('item', 'title price images author');
    await flag.populate('reporter', 'username firstName lastName');
    await flag.populate('reviewedBy', 'username firstName lastName');
    
    res.json({ 
      message: 'Flag dismissed',
      flag: flag
    });
  } catch (error) {
    console.error('Error dismissing flag:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get items flagged for review (admin only)
router.get('/flagged-for-review', authenticateToken, superAdminAuth, async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ status: 'flagged_for_review' })
      .populate('author', 'username firstName lastName')
      .populate('restoredBy', 'username firstName lastName')
      .sort({ flaggedForReviewAt: -1 });
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching items flagged for review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restore a flagged item (admin only)
router.put('/restore-item/:itemId', authenticateToken, superAdminAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { adminNotes } = req.body;
    
    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.status !== 'flagged_for_review') {
      return res.status(400).json({ message: 'Item is not flagged for review' });
    }
    
    await item.restoreItem(req.user.id);
    
    // Update admin notes if provided
    if (adminNotes) {
      item.adminNotes = adminNotes;
      await item.save();
    }
    
    // Notify the item owner
    await Notification.createNotification(
      item.author,
      req.user.id,
      'item_restored',
      'Item Restored',
      `Your item "${item.title}" has been reviewed and restored to the marketplace.`,
      itemId,
      null,
      {
        itemTitle: item.title,
        adminNotes: adminNotes || 'No additional notes provided'
      }
    );
    
    console.log('✅ Item restored:', {
      itemId,
      title: item.title,
      restoredBy: req.user.id
    });
    
    res.json({ 
      message: 'Item restored successfully',
      item: item
    });
  } catch (error) {
    console.error('Error restoring item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Permanently remove a flagged item (admin only)
router.put('/remove-item/:itemId', authenticateToken, superAdminAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { adminNotes } = req.body;
    
    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.status !== 'flagged_for_review') {
      return res.status(400).json({ message: 'Item is not flagged for review' });
    }
    
    await item.removeDueToFlags();
    
    // Update admin notes if provided
    if (adminNotes) {
      item.adminNotes = adminNotes;
      await item.save();
    }
    
    // Notify the item owner
    await Notification.createNotification(
      item.author,
      req.user.id,
      'item_removed',
      'Item Removed',
      `Your item "${item.title}" has been removed from the marketplace due to multiple flags.`,
      itemId,
      null,
      {
        itemTitle: item.title,
        adminNotes: adminNotes || 'Item removed due to multiple community flags'
      }
    );
    
    console.log('🗑️ Item removed:', {
      itemId,
      title: item.title,
      removedBy: req.user.id
    });
    
    res.json({ 
      message: 'Item removed successfully',
      item: item
    });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get flag statistics (admin only)
router.get('/stats', authenticateToken, superAdminAuth, async (req, res) => {
  try {
    const stats = await MarketplaceFlag.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const reasonStats = await MarketplaceFlag.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get items flagged for review count
    const flaggedForReviewCount = await MarketplaceItem.countDocuments({ 
      status: 'flagged_for_review' 
    });
    
    res.json({
      statusStats: stats,
      reasonStats: reasonStats,
      flaggedForReviewCount: flaggedForReviewCount
    });
  } catch (error) {
    console.error('Error fetching flag statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
