const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  type: {
    type: String,
    enum: ['email', 'in_app', 'both'],
    default: 'both'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'individual', 'players', 'coaches', 'referees', 'volunteers', 'admins', 'custom'],
    default: 'all'
  },
  customRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  scheduledFor: {
    type: Date,
    default: null
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
  },
  sentAt: {
    type: Date,
    default: null
  },
  deliveryStats: {
    totalRecipients: { type: Number, default: 0 },
    emailsSent: { type: Number, default: 0 },
    emailsFailed: { type: Number, default: 0 },
    inAppDelivered: { type: Number, default: 0 },
    inAppRead: { type: Number, default: 0 }
  },
  errorLog: [{
    timestamp: { type: Date, default: Date.now },
    error: String,
    recipient: String
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
broadcastSchema.index({ status: 1, scheduledFor: 1 });
broadcastSchema.index({ sentBy: 1, createdAt: -1 });
broadcastSchema.index({ targetAudience: 1, status: 1 });
broadcastSchema.index({ priority: 1, createdAt: -1 });

module.exports = mongoose.model('Broadcast', broadcastSchema);
