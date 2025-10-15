const express = require('express');
const router = express.Router();
const Broadcast = require('../models/Broadcast');
const BroadcastDelivery = require('../models/BroadcastDelivery');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Import auth middleware from auth routes
const { auth } = require('./auth');
const admin = require('../middleware/admin');

// Helper function to check if user is admin
const isAdmin = (user) => {
  return user.isAdmin || user.isSuperAdmin;
};

// Helper function to send email
const sendEmail = async (to, subject, content) => {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: content
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Test route to check users in database
router.get('/test/users', auth, async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const allUsers = await User.find({});
    const adminUsers = await User.find({ $or: [{ isSuperAdmin: true }, { isAdmin: true }] });
    const playerUsers = await User.find({ team: { $exists: true, $ne: '' } });
    const coachUsers = await User.find({ coach: { $exists: true, $ne: '' } });

    res.json({
      totalUsers: allUsers.length,
      adminUsers: adminUsers.length,
      playerUsers: playerUsers.length,
      coachUsers: coachUsers.length,
      sampleUsers: allUsers.slice(0, 5).map(u => ({ id: u._id, username: u.username, email: u.email, isSuperAdmin: u.isSuperAdmin, isAdmin: u.isAdmin }))
    });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get all broadcasts (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const broadcasts = await Broadcast.find()
      .populate('sentBy', 'username')
      .populate('customRecipients', 'username email')
      .sort({ createdAt: -1 });

    res.json(broadcasts);
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

// Get user's broadcasts (for regular users)
router.get('/my-broadcasts', auth, async (req, res) => {
  try {
    const deliveries = await BroadcastDelivery.find({ 
      user: req.user._id,
      inAppDelivered: true 
    })
    .populate({
      path: 'broadcast',
      populate: { path: 'sentBy', select: 'username' }
    })
    .sort({ createdAt: -1 });

    const broadcasts = deliveries.map(delivery => ({
      id: delivery.broadcast._id,
      title: delivery.broadcast.title,
      content: delivery.broadcast.content,
      sentBy: delivery.broadcast.sentBy.username,
      sentAt: delivery.broadcast.sentAt,
      priority: delivery.broadcast.priority,
      tags: delivery.broadcast.tags,
      inAppRead: delivery.inAppRead,
      inAppReadAt: delivery.inAppReadAt,
      createdAt: delivery.broadcast.createdAt
    }));

    res.json(broadcasts);
  } catch (error) {
    console.error('Error fetching user broadcasts:', error);
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

// Get unread broadcast count for user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await BroadcastDelivery.countDocuments({
      user: req.user._id,
      inAppDelivered: true,
      inAppRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread broadcast count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Get single broadcast
router.get('/:id', auth, async (req, res) => {
  try {
    const broadcast = await Broadcast.findById(req.params.id)
      .populate('sentBy', 'username')
      .populate('customRecipients', 'username email');

    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }

    // Check if user has access to this broadcast
    if (!isAdmin(req.user)) {
      const delivery = await BroadcastDelivery.findOne({
        broadcast: req.params.id,
        user: req.user._id
      });

      if (!delivery || !delivery.inAppDelivered) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(broadcast);
  } catch (error) {
    console.error('Error fetching broadcast:', error);
    res.status(500).json({ error: 'Failed to fetch broadcast' });
  }
});

// Create new broadcast (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { 
      title, 
      content, 
      type, 
      targetAudience, 
      customRecipients, 
      targetUsers,
      scheduledFor, 
      priority, 
      tags, 
      isPublic 
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    console.log('📝 Creating broadcast with data:', {
      title,
      content,
      type,
      targetAudience,
      targetUsers: targetUsers ? targetUsers.length : 0,
      customRecipients: customRecipients ? customRecipients.length : 0
    });

    // Handle individual messaging - if targetUsers is provided, set targetAudience to 'individual'
    let finalTargetAudience = targetAudience || 'all';
    let finalCustomRecipients = customRecipients || [];
    
    if (targetUsers && targetUsers.length > 0) {
      finalTargetAudience = 'individual';
      finalCustomRecipients = targetUsers;
      console.log('🎯 Individual message detected for', targetUsers.length, 'users');
    }

    const broadcast = new Broadcast({
      title,
      content,
      type: type || 'both',
      targetAudience: finalTargetAudience,
      customRecipients: finalCustomRecipients,
      scheduledFor: scheduledFor || null,
      sentBy: req.user._id,
      status: scheduledFor ? 'scheduled' : 'draft',
      priority: priority || 'normal',
      tags: tags || [],
      isPublic: isPublic || false
    });

    console.log('💾 Saving broadcast...');
    await broadcast.save();
    console.log('✅ Broadcast saved successfully');

    // For individual messages, send immediately
    if (finalTargetAudience === 'individual' && !scheduledFor) {
      try {
        console.log('🚀 Auto-sending individual message to', finalCustomRecipients.length, 'users');
        
        // Get recipients
        const recipients = await User.find({ _id: { $in: finalCustomRecipients } });
        console.log('🔍 Found recipients:', recipients.map(u => ({ id: u._id, username: u.username, email: u.email })));

        if (recipients.length === 0) {
          console.log('⚠️ No recipients found for individual message');
        } else {
          // Create delivery records
          const deliveryRecords = recipients.map(user => ({
            broadcast: broadcast._id,
            user: user._id
          }));

          await BroadcastDelivery.insertMany(deliveryRecords);
          console.log('📨 Delivery records created for', recipients.length, 'users');

          // Mark in-app messages as delivered
          if (broadcast.type === 'in_app' || broadcast.type === 'both') {
            await BroadcastDelivery.updateMany(
              { broadcast: broadcast._id },
              { 
                inAppDelivered: true, 
                inAppDeliveredAt: new Date(),
                status: 'delivered'
              }
            );
            console.log('📱 In-app messages marked as delivered');
          }

          // Update broadcast status and stats
          broadcast.status = 'sent';
          broadcast.sentAt = new Date();
          broadcast.deliveryStats = {
            totalRecipients: recipients.length,
            emailsSent: 0,
            emailsFailed: 0,
            inAppDelivered: recipients.length,
            inAppRead: 0
          };

          await broadcast.save();
          console.log('✅ Individual message sent successfully to', recipients.length, 'users');
        }
      } catch (sendError) {
        console.error('❌ Error sending individual message:', sendError);
        // Don't fail the entire request if sending fails
      }
    }

    const populatedBroadcast = await Broadcast.findById(broadcast._id)
      .populate('sentBy', 'username')
      .populate('customRecipients', 'username email');

    res.status(201).json(populatedBroadcast);
  } catch (error) {
    console.error('❌ Error creating broadcast:', error);
    res.status(500).json({ error: 'Failed to create broadcast', details: error.message });
  }
});

// Send broadcast (admin only)
router.post('/:id/send', auth, async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const broadcast = await Broadcast.findById(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }

    if (broadcast.status === 'sent') {
      return res.status(400).json({ error: 'Broadcast already sent' });
    }

    // Update status to sending
    broadcast.status = 'sending';
    await broadcast.save();

    // Get recipients based on target audience
    let recipients = [];
    
    console.log('🔍 Broadcast sending - Target audience:', broadcast.targetAudience);
    
    if (broadcast.targetAudience === 'all') {
      recipients = await User.find({});
      console.log('🔍 Found', recipients.length, 'users for "all" target');
    } else if (broadcast.targetAudience === 'individual') {
      recipients = await User.find({ _id: { $in: broadcast.customRecipients } });
      console.log('🔍 Found', recipients.length, 'users for individual target');
    } else if (broadcast.targetAudience === 'custom') {
      recipients = await User.find({ _id: { $in: broadcast.customRecipients } });
      console.log('🔍 Found', recipients.length, 'users for custom target');
    } else if (broadcast.targetAudience === 'admins') {
      recipients = await User.find({ $or: [{ isSuperAdmin: true }, { isAdmin: true }] });
      console.log('🔍 Found', recipients.length, 'admin users');
    } else if (broadcast.targetAudience === 'players') {
      recipients = await User.find({ team: { $exists: true, $ne: '' } });
      console.log('🔍 Found', recipients.length, 'player users');
    } else if (broadcast.targetAudience === 'coaches') {
      recipients = await User.find({ coach: { $exists: true, $ne: '' } });
      console.log('🔍 Found', recipients.length, 'coach users');
    } else if (broadcast.targetAudience === 'referees') {
      // For now, include all users since we don't have a specific referee field
      recipients = await User.find({});
      console.log('🔍 Found', recipients.length, 'users for referees (defaulting to all)');
    } else if (broadcast.targetAudience === 'volunteers') {
      // For now, include all users since we don't have a specific volunteer field
      recipients = await User.find({});
      console.log('🔍 Found', recipients.length, 'users for volunteers (defaulting to all)');
    } else {
      // Default to all users if target audience is not recognized
      recipients = await User.find({});
      console.log('🔍 Found', recipients.length, 'users (default case)');
    }

    console.log('🔍 Recipients found:', recipients.map(u => ({ id: u._id, username: u.username, email: u.email })));

    // Create delivery records
    const deliveryRecords = recipients.map(user => ({
      broadcast: broadcast._id,
      user: user._id
    }));

    await BroadcastDelivery.insertMany(deliveryRecords);

    // Send emails if needed
    let emailsSent = 0;
    let emailsFailed = 0;

    if (broadcast.type === 'email' || broadcast.type === 'both') {
      for (const user of recipients) {
        try {
          const emailContent = `
            <h2>${broadcast.title}</h2>
            <p>${broadcast.content}</p>
            <hr>
            <p><small>Sent by: ${req.user.username}</small></p>
          `;

          const emailSent = await sendEmail(user.email, broadcast.title, emailContent);
          
          if (emailSent) {
            emailsSent++;
            await BroadcastDelivery.findOneAndUpdate(
              { broadcast: broadcast._id, user: user._id },
              { 
                emailSent: true, 
                emailSentAt: new Date(),
                status: 'sent'
              }
            );
          } else {
            emailsFailed++;
            await BroadcastDelivery.findOneAndUpdate(
              { broadcast: broadcast._id, user: user._id },
              { 
                emailError: 'Failed to send email',
                status: 'failed'
              }
            );
          }
        } catch (error) {
          emailsFailed++;
          console.error(`Failed to send email to ${user.email}:`, error);
        }
      }
    }

    // Mark in-app messages as delivered
    if (broadcast.type === 'in_app' || broadcast.type === 'both') {
      await BroadcastDelivery.updateMany(
        { broadcast: broadcast._id },
        { 
          inAppDelivered: true, 
          inAppDeliveredAt: new Date(),
          status: 'delivered'
        }
      );
    }

    // Update broadcast status and stats
    broadcast.status = 'sent';
    broadcast.sentAt = new Date();
    broadcast.deliveryStats = {
      totalRecipients: recipients.length,
      emailsSent,
      emailsFailed,
      inAppDelivered: recipients.length,
      inAppRead: 0
    };

    await broadcast.save();

    res.json({
      message: 'Broadcast sent successfully',
      stats: broadcast.deliveryStats
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

// Mark broadcast as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    const delivery = await BroadcastDelivery.findOne({
      broadcast: req.params.id,
      user: req.user._id
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Broadcast delivery not found' });
    }

    delivery.inAppRead = true;
    delivery.inAppReadAt = new Date();
    delivery.status = 'read';
    await delivery.save();

    // Update broadcast stats
    await Broadcast.findByIdAndUpdate(req.params.id, {
      $inc: { 'deliveryStats.inAppRead': 1 }
    });

    res.json({ message: 'Broadcast marked as read' });
  } catch (error) {
    console.error('Error marking broadcast as read:', error);
    res.status(500).json({ error: 'Failed to mark broadcast as read' });
  }
});

// Get broadcast stats (admin only)
router.get('/:id/stats', auth, async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const broadcast = await Broadcast.findById(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }

    const deliveries = await BroadcastDelivery.find({ broadcast: req.params.id });
    
    const stats = {
      totalRecipients: deliveries.length,
      emailsSent: deliveries.filter(d => d.emailSent).length,
      emailsFailed: deliveries.filter(d => d.emailError).length,
      inAppDelivered: deliveries.filter(d => d.inAppDelivered).length,
      inAppRead: deliveries.filter(d => d.inAppRead).length,
      statusBreakdown: {
        pending: deliveries.filter(d => d.status === 'pending').length,
        sent: deliveries.filter(d => d.status === 'sent').length,
        delivered: deliveries.filter(d => d.status === 'delivered').length,
        read: deliveries.filter(d => d.status === 'read').length,
        failed: deliveries.filter(d => d.status === 'failed').length
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching broadcast stats:', error);
    res.status(500).json({ error: 'Failed to fetch broadcast stats' });
  }
});

// Delete broadcast (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const broadcast = await Broadcast.findById(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }

    // Check if broadcast has been sent
    const wasSent = broadcast.status === 'sent';
    const recipientCount = broadcast.deliveryStats?.totalRecipients || 0;

    // Delete delivery records first
    await BroadcastDelivery.deleteMany({ broadcast: req.params.id });
    
    // Delete broadcast
    await Broadcast.findByIdAndDelete(req.params.id);

    if (wasSent) {
      res.json({ 
        message: 'Broadcast deleted successfully', 
        warning: `This broadcast was already sent to ${recipientCount} recipients. The message has been removed from the system but may have already been delivered.`
      });
    } else {
      res.json({ message: 'Broadcast deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    res.status(500).json({ error: 'Failed to delete broadcast' });
  }
});

module.exports = router;
