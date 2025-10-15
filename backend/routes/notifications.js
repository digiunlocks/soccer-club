const express = require('express');
const router = express.Router();
const { auth: authenticateToken } = require('./auth');
const Notification = require('../models/Notification');

// Get all notifications for the current user
router.get('/', authenticateToken, async (req, res) => {
  console.log('\n========================================');
  console.log('📬 GET NOTIFICATIONS ENDPOINT CALLED');
  console.log('========================================');
  console.log('User ID:', req.user._id);
  console.log('User Username:', req.user.username);
  
  try {
    // Try both req.user.id and req.user._id
    const userId = req.user._id || req.user.id;
    console.log('Querying notifications for user:', userId);
    
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username firstName lastName avatar')
      .populate('marketplaceItem', 'title price images')
      .sort({ createdAt: -1 });
    
    console.log('✅ Found', notifications.length, 'notifications');
    
    if (notifications.length > 0) {
      console.log('\n📋 Notifications list:');
      notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. [${notif.read ? 'READ' : 'UNREAD'}] ${notif.type}`);
        console.log(`      Title: ${notif.title}`);
        console.log(`      From: ${notif.sender?.username || 'Unknown'}`);
        console.log(`      Created: ${notif.createdAt}`);
      });
    } else {
      console.log('⚠️  No notifications found for this user');
      
      // Debug: Check if any notifications exist for this user
      const allUserNotifs = await Notification.countDocuments({ 
        recipient: userId 
      });
      console.log('Total notifications in DB for user:', allUserNotifs);
    }
    
    console.log('========================================\n');
    res.json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    console.error('Stack:', error.stack);
    console.log('========================================\n');
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    console.log('🔔 GET UNREAD COUNT for user:', userId);
    const count = await Notification.getUnreadCount(userId);
    console.log('   Unread count:', count);
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await notification.markAsRead();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
