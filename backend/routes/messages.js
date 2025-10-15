const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { auth: authenticateToken } = require('./auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Messages router is working' });
});

// Send announcement to all users (admin only) - PLACE THIS BEFORE OTHER POST ROUTES
router.post('/announcement', authenticateToken, async (req, res) => {
  console.log('🔍 Announcement route hit!');
  console.log('🔍 Request body:', req.body);
  console.log('🔍 User:', req.user);
  
  try {
    // Check if user is admin
    if (!req.user.isSuperAdmin && !req.user.isAdmin) {
      console.log('❌ User is not admin');
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, content, targetAudience } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Get all users based on target audience
    let users = [];
    
    if (targetAudience === 'all') {
      users = await User.find({});
    } else if (targetAudience === 'admins') {
      users = await User.find({ $or: [{ isSuperAdmin: true }, { isAdmin: true }] });
    } else if (targetAudience === 'players') {
      users = await User.find({ team: { $exists: true, $ne: '' } });
    } else if (targetAudience === 'coaches') {
      users = await User.find({ coach: { $exists: true, $ne: '' } });
    } else {
      users = await User.find({});
    }

    // Create announcement message for each user
    const announcementContent = `📢 **${title}**\n\n${content}\n\n*Sent by: ${req.user.username}*`;
    
    const messages = users.map(user => ({
      sender: req.user._id,
      recipient: user._id,
      content: announcementContent,
      messageType: 'announcement',
      isRead: false
    }));

    // Save all messages
    await Message.insertMany(messages);

    console.log(`📢 Announcement sent to ${users.length} users: "${title}"`);

    res.json({ 
      success: true, 
      message: `Announcement sent to ${users.length} users`,
      recipients: users.length
    });

  } catch (error) {
    console.error('Error sending announcement:', error);
    res.status(500).json({ error: 'Failed to send announcement' });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/messages');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'message-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed'));
    }
  }
});

// Get all conversations for the authenticated user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Message.getUserConversations(req.user.id);
    
    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = conv.lastMessage;
        const otherUserId = lastMessage.sender.toString() === req.user.id 
          ? lastMessage.recipient 
          : lastMessage.sender;
        
        const otherUser = await User.findById(otherUserId).select('username firstName lastName avatar');
        
        return {
          conversationId: conv._id,
          lastMessage: {
            ...lastMessage,
            sender: await User.findById(lastMessage.sender).select('username firstName lastName avatar'),
            recipient: await User.findById(lastMessage.recipient).select('username firstName lastName avatar')
          },
          otherUser,
          unreadCount: conv.unreadCount,
          updatedAt: lastMessage.createdAt
        };
      })
    );
    
    res.json(populatedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete conversation (delete all messages in a conversation) - PLACE THIS BEFORE GET /conversation/:userId
router.delete('/conversation/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    
    console.log('🔍 Deleting conversation with user:', otherUserId);
    console.log('🔍 Current user:', req.user.id);
    
    // Find all messages between the current user and the other user
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user.id }
      ]
    });
    
    console.log('🔍 Found messages to delete:', messages.length);
    
    if (messages.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Delete all messages in the conversation
    await Message.deleteMany({
      $or: [
        { sender: req.user.id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user.id }
      ]
    });
    
    console.log('✅ Conversation deleted with user:', otherUserId, 'Messages deleted:', messages.length);
    
    res.json({ message: 'Conversation deleted successfully', deletedCount: messages.length });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const messages = await Message.getConversation(req.user.id, userId);
    
    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: messages[0]?.conversationId,
        recipient: req.user.id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a text message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { recipientId, content, messageType, offerAmount, marketplaceItemId } = req.body;
    
    console.log('🔍 Received message data:', {
      recipientId,
      content: content?.substring(0, 50) + '...',
      messageType,
      offerAmount,
      marketplaceItemId
    });
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Prevent sending message to self
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }
    
    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content: content.trim(),
      messageType: messageType || 'regular',
      marketplaceItemId: marketplaceItemId || null
    });
    
    // Add offer amount if provided (for both marketplace and regular conversations)
    if (offerAmount) {
      message.offerAmount = offerAmount;
    }
    
    await message.save();
    
    console.log('✅ Saved message with offer data:', {
      messageId: message._id,
      messageType: message.messageType,
      offerAmount: message.offerAmount
    });
    
    // Create notification for offers
    if (messageType === 'offer' && offerAmount) {
      const Notification = require('../models/Notification');
      const sender = await User.findById(req.user._id);
      
      let notificationData = {
        offerAmount: offerAmount,
        senderName: sender.username || sender.name,
        message: content.trim()
      };
      
      // If this is related to a marketplace item, add item details
      if (marketplaceItemId) {
        const MarketplaceItem = require('../models/MarketplaceItem');
        const item = await MarketplaceItem.findById(marketplaceItemId);
        if (item) {
          notificationData.itemTitle = item.title;
          notificationData.itemPrice = item.price;
        }
        
        console.log('🔔 Creating marketplace offer notification for recipient:', recipientId);
        
        await Notification.createNotification(
          recipientId,
          req.user._id,
          'negotiation_offer',
          'New Offer Received',
          `${sender.username || sender.name || 'A buyer'} made an offer of $${offerAmount}${item ? ` on "${item.title}"` : ''}`,
          marketplaceItemId,
          null,
          notificationData
        );
      } else {
        // Regular offer (not marketplace related)
        console.log('🔔 Creating regular offer notification for recipient:', recipientId);
        
        await Notification.createNotification(
          recipientId,
          req.user._id,
          'message_received',
          'New Offer Received',
          `${sender.username || sender.name} sent you an offer of $${offerAmount}`,
          null,
          null,
          notificationData
        );
      }
      
      console.log('✅ Offer notification created for recipient');
    }
    
    // Populate sender and recipient details
    await message.populate('sender', 'username firstName lastName avatar');
    await message.populate('recipient', 'username firstName lastName avatar');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message with file attachment
router.post('/send-with-attachment', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const { recipientId, content, relatedItem, relatedItemModel } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Prevent sending message to self
    if (recipientId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }
    
    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/messages/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype
    };
    
    // Determine message type based on file type
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const messageType = imageTypes.includes(req.file.mimetype) ? 'image' : 'file';
    
    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      content: content || '',
      messageType: 'file'
    });
    
    await message.save();
    
    // Populate sender and recipient details
    await message.populate('sender', 'username firstName lastName avatar');
    await message.populate('recipient', 'username firstName lastName avatar');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message with attachment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/mark-read/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await Message.updateMany(
      {
        conversationId,
        recipient: req.user.id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Delete a message (user can delete their own messages or messages sent to them)
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user can delete this message (sender or recipient)
    // For announcements, users should be able to delete announcements sent to them
    if (message.sender.toString() !== req.user.id && message.recipient.toString() !== req.user.id) {
      console.log('❌ Delete authorization failed:', {
        messageSender: message.sender.toString(),
        messageRecipient: message.recipient.toString(),
        userId: req.user.id,
        messageType: message.messageType
      });
      return res.status(403).json({ message: 'You can only delete your own messages or messages sent to you' });
    }
    
    // Delete the message
    await Message.findByIdAndDelete(messageId);
    
    console.log('✅ Message deleted:', messageId);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count for notifications
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      isRead: false
    });
    
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users for messaging
router.get('/search-users', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }
    
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user.id } // Exclude current user
    })
    .select('username firstName lastName avatar')
    .limit(10);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Get user's announcements
router.get('/announcements', authenticateToken, async (req, res) => {
  try {
    const announcements = await Message.find({
      recipient: req.user._id,
      messageType: 'announcement'
    })
    .populate('sender', 'username')
    .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Delete all announcements for a user
router.delete('/announcements/delete-all', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Deleting all announcements for user:', req.user.id);
    
    const result = await Message.deleteMany({
      recipient: req.user._id,
      messageType: 'announcement'
    });
    
    console.log('✅ Deleted announcements count:', result.deletedCount);
    
    res.json({ 
      message: 'All announcements deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting announcements:', error);
    res.status(500).json({ error: 'Failed to delete announcements' });
  }
});

// Mark announcement as read
router.put('/announcements/:id/read', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id,
        messageType: 'announcement'
      },
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking announcement as read:', error);
    res.status(500).json({ error: 'Failed to mark announcement as read' });
  }
});

// Get unread announcement count
router.get('/announcements/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      messageType: 'announcement',
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Error getting unread announcement count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Unified inbox - get all messages for a user organized by type
router.get('/unified-inbox', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
    .populate('sender', 'name username email')
    .populate('recipient', 'name username email')
    .populate('marketplaceItemId', 'title price images')
    .sort({ createdAt: -1 });

    // Organize messages by type
    const organizedMessages = {
      marketplace: messages.filter(msg => 
        msg.messageType === 'marketplace_inquiry' || 
        msg.messageType === 'offer' ||
        msg.marketplaceItemId
      ),
      general: messages.filter(msg => 
        msg.messageType === 'regular' || 
        msg.messageType === 'general_inquiry'
      ),
      parent_coach: messages.filter(msg => 
        msg.messageType === 'parent_coach'
      ),
      support: messages.filter(msg => 
        msg.messageType === 'support'
      ),
      announcements: messages.filter(msg => 
        msg.messageType === 'announcement' || 
        msg.messageType === 'broadcast'
      )
    };

    // Get unread counts for each category
    const unreadCounts = {
      marketplace: await Message.countDocuments({
        $or: [
          { sender: userId },
          { recipient: userId }
        ],
        messageType: { $in: ['marketplace_inquiry', 'offer'] },
        isRead: false,
        recipient: userId
      }),
      general: await Message.countDocuments({
        $or: [
          { sender: userId },
          { recipient: userId }
        ],
        messageType: { $in: ['regular', 'general_inquiry'] },
        isRead: false,
        recipient: userId
      }),
      parent_coach: await Message.countDocuments({
        $or: [
          { sender: userId },
          { recipient: userId }
        ],
        messageType: 'parent_coach',
        isRead: false,
        recipient: userId
      }),
      support: await Message.countDocuments({
        $or: [
          { sender: userId },
          { recipient: userId }
        ],
        messageType: 'support',
        isRead: false,
        recipient: userId
      }),
      announcements: await Message.countDocuments({
        $or: [
          { sender: userId },
          { recipient: userId }
        ],
        messageType: { $in: ['announcement', 'broadcast'] },
        isRead: false,
        recipient: userId
      })
    };

    res.json({
      messages: organizedMessages,
      unreadCounts,
      totalUnread: Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
    });
  } catch (error) {
    console.error('Error getting unified inbox:', error);
    res.status(500).json({ error: 'Failed to get unified inbox' });
  }
});

// Send marketplace inquiry message
router.post('/marketplace-inquiry', authenticateToken, async (req, res) => {
  try {
    const { recipientId, marketplaceItemId, content, offerAmount } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !content) {
      return res.status(400).json({ error: 'Recipient ID and content are required' });
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
      marketplaceItemId: marketplaceItemId || null,
      offerAmount: offerAmount || null,
      messageType: 'marketplace_inquiry'
    });

    await message.save();
    await message.populate('sender', 'name username email');
    await message.populate('recipient', 'name username email');
    await message.populate('marketplaceItemId', 'title price images');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending marketplace inquiry:', error);
    res.status(500).json({ error: 'Failed to send marketplace inquiry' });
  }
});

// Send general message
router.post('/general-message', authenticateToken, async (req, res) => {
  try {
    const { recipientId, content, messageType = 'general_inquiry' } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !content) {
      return res.status(400).json({ error: 'Recipient ID and content are required' });
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
      messageType
    });

    await message.save();
    await message.populate('sender', 'name username email');
    await message.populate('recipient', 'name username email');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending general message:', error);
    res.status(500).json({ error: 'Failed to send general message' });
  }
});

// Get conversation between two users
router.get('/conversation/:userId1/:userId2', authenticateToken, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const currentUserId = req.user._id;

    // Verify user is part of this conversation
    if (currentUserId.toString() !== userId1 && currentUserId.toString() !== userId2) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 }
      ]
    })
    .populate('sender', 'name username email')
    .populate('recipient', 'name username email')
    .populate('marketplaceItemId', 'title price images')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Mark messages as read
router.put('/mark-read', authenticateToken, async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ error: 'Message IDs array is required' });
    }

    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        recipient: userId 
      },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;
