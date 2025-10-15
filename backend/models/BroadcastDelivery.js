const mongoose = require('mongoose');

const broadcastDeliverySchema = new mongoose.Schema({
  broadcast: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Broadcast',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  },
  emailError: {
    type: String,
    default: null
  },
  inAppDelivered: {
    type: Boolean,
    default: false
  },
  inAppDeliveredAt: {
    type: Date,
    default: null
  },
  inAppRead: {
    type: Boolean,
    default: false
  },
  inAppReadAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure unique combination of broadcast and user
broadcastDeliverySchema.index({ broadcast: 1, user: 1 }, { unique: true });
broadcastDeliverySchema.index({ user: 1, inAppRead: 1 });
broadcastDeliverySchema.index({ broadcast: 1, status: 1 });
broadcastDeliverySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('BroadcastDelivery', broadcastDeliverySchema);
