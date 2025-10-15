const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  offerAmount: {
    type: Number,
    default: null
  },
  marketplaceItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    default: null
  },
  messageType: {
    type: String,
    enum: ['regular', 'announcement', 'broadcast', 'offer', 'marketplace_inquiry', 'parent_coach', 'general_inquiry', 'support'],
    default: 'regular'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  conversationId: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Create conversation ID from sender and recipient (sorted to ensure consistency)
messageSchema.pre('save', function(next) {
  const participants = [this.sender.toString(), this.recipient.toString()].sort();
  this.conversationId = participants.join('_');
  next();
});

// Index for efficient querying
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(user1Id, user2Id) {
  const participants = [user1Id.toString(), user2Id.toString()].sort();
  const conversationId = participants.join('_');
  
  return this.find({
    conversationId
  })
  .populate('sender', 'username firstName lastName avatar')
  .populate('recipient', 'username firstName lastName avatar')
  .sort({ createdAt: 1 });
};

// Static method to get all conversations for a user
messageSchema.statics.getUserConversations = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { recipient: new mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Message', messageSchema);
