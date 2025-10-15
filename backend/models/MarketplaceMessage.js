const mongoose = require('mongoose');

const marketplaceMessageSchema = new mongoose.Schema({
  simpleId: {
    type: String,
    unique: true,
    sparse: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    required: true
  },
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
  messageType: {
    type: String,
    enum: ['offer', 'counter_offer', 'accept', 'reject', 'message', 'withdraw'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  offerAmount: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  originalOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceMessage'
  },
  negotiationChain: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceMessage'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // Transaction completion
  markedAsReceived: {
    type: Boolean,
    default: false
  },
  receivedAt: {
    type: Date
  },
  buyerRated: {
    type: Boolean,
    default: false
  },
  sellerRated: {
    type: Boolean,
    default: false
  },
  completedTransaction: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Indexes
marketplaceMessageSchema.index({ item: 1, sender: 1, recipient: 1 });
marketplaceMessageSchema.index({ recipient: 1, read: 1, createdAt: -1 });

// Get conversation between users for an item
marketplaceMessageSchema.statics.getConversation = async function(itemId, userId1, userId2) {
  return this.find({
    item: itemId,
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 }
    ]
  })
  .populate('sender', 'username firstName lastName')
  .populate('recipient', 'username firstName lastName')
  .populate('item', 'title price images')
  .sort({ createdAt: 1 });
};

// Get unread count for user
marketplaceMessageSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

// Get user conversations
marketplaceMessageSchema.statics.getUserConversations = async function(userId) {
  const conversations = await this.aggregate([
    {
      $match: {
        $or: [
          { sender: mongoose.Types.ObjectId(userId) },
          { recipient: mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $group: {
        _id: {
          item: '$item',
          otherUser: {
            $cond: {
              if: { $eq: ['$sender', mongoose.Types.ObjectId(userId)] },
              then: '$recipient',
              else: '$sender'
            }
          }
        },
        lastMessage: { $last: '$$ROOT' },
        messageCount: { $sum: 1 },
        unreadCount: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ['$recipient', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$read', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);

  return this.populate(conversations, [
    { path: '_id.item', select: 'title price images author' },
    { path: '_id.otherUser', select: 'username firstName lastName' },
    { path: 'lastMessage.sender', select: 'username firstName lastName' },
    { path: 'lastMessage.recipient', select: 'username firstName lastName' }
  ]);
};

// Mark as read
marketplaceMessageSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Get negotiation chain for an offer
marketplaceMessageSchema.statics.getNegotiationChain = async function(originalOfferId) {
  return this.find({
    $or: [
      { _id: originalOfferId },
      { originalOfferId: originalOfferId }
    ]
  })
  .populate('sender', 'username firstName lastName')
  .populate('recipient', 'username firstName lastName')
  .populate('item', 'title price images')
  .sort({ createdAt: 1 });
};

// Get active offers for an item
marketplaceMessageSchema.statics.getActiveOffers = async function(itemId) {
  return this.find({
    item: itemId,
    messageType: { $in: ['offer', 'counter_offer'] },
    status: 'pending',
    isActive: true
  })
  .populate('sender', 'username firstName lastName')
  .populate('recipient', 'username firstName lastName')
  .populate('item', 'title price images')
  .sort({ createdAt: -1 });
};

// Accept an offer
marketplaceMessageSchema.methods.acceptOffer = async function() {
  this.status = 'accepted';
  this.isActive = false;
  
  // Mark all other offers for this item as rejected
  await this.constructor.updateMany(
    {
      item: this.item,
      _id: { $ne: this._id },
      messageType: { $in: ['offer', 'counter_offer'] },
      status: 'pending'
    },
    { 
      status: 'rejected',
      isActive: false
    }
  );
  
  return this.save();
};

// Reject an offer
marketplaceMessageSchema.methods.rejectOffer = async function() {
  this.status = 'rejected';
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('MarketplaceMessage', marketplaceMessageSchema);
