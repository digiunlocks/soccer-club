const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'negotiation_offer',
      'negotiation_counter_offer', 
      'negotiation_accept',
      'negotiation_reject',
      'offer_accepted',
      'offer_rejected',
      'offer_withdrawn',
      'transaction_completed',
      'marketplace_inquiry',
      'message',
      'message_received',
      'application_status',
      'broadcast',
      'announcement',
      'item_expiring_soon',
      'item_expired',
      'item_extended'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Related entities
  marketplaceItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem'
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  // Additional data for context
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Static method to create notifications
notificationSchema.statics.createNotification = async function(
  recipientId, 
  senderId, 
  type, 
  title, 
  message, 
  marketplaceItemId = null, 
  applicationId = null, 
  data = {}
) {
  const notification = new this({
    recipient: recipientId,
    sender: senderId,
    type,
    title,
    message,
    marketplaceItem: marketplaceItemId,
    application: applicationId,
    data
  });
  
  return await notification.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ recipient: userId, read: false });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
