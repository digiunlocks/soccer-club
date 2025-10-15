const mongoose = require('mongoose');

const marketplaceFlagSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: [
      'inappropriate_content',
      'spam_fake',
      'misleading_description',
      'overpriced',
      'prohibited_item',
      'duplicate_listing',
      'harassment',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  isResolved: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Indexes for efficient querying
marketplaceFlagSchema.index({ item: 1, reporter: 1 });
marketplaceFlagSchema.index({ status: 1, createdAt: -1 });
marketplaceFlagSchema.index({ reporter: 1, createdAt: -1 });

// Prevent duplicate flags from the same user for the same item
marketplaceFlagSchema.index({ item: 1, reporter: 1 }, { unique: true });

// Get flags for an item
marketplaceFlagSchema.statics.getFlagsForItem = async function(itemId) {
  return this.find({ item: itemId })
    .populate('reporter', 'username firstName lastName')
    .populate('reviewedBy', 'username firstName lastName')
    .sort({ createdAt: -1 });
};

// Get pending flags
marketplaceFlagSchema.statics.getPendingFlags = async function() {
  return this.find({ status: 'pending' })
    .populate('item', 'title price images author')
    .populate('reporter', 'username firstName lastName')
    .sort({ createdAt: -1 });
};

// Get flags by user
marketplaceFlagSchema.statics.getFlagsByUser = async function(userId) {
  return this.find({ reporter: userId })
    .populate('item', 'title price images')
    .sort({ createdAt: -1 });
};

// Mark flag as reviewed
marketplaceFlagSchema.methods.markAsReviewed = async function(reviewedBy, adminNotes = '') {
  this.status = 'reviewed';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.adminNotes = adminNotes;
  return this.save();
};

// Resolve flag
marketplaceFlagSchema.methods.resolve = async function(reviewedBy, adminNotes = '') {
  this.status = 'resolved';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.adminNotes = adminNotes;
  this.isResolved = true;
  return this.save();
};

// Dismiss flag
marketplaceFlagSchema.methods.dismiss = async function(reviewedBy, adminNotes = '') {
  this.status = 'dismissed';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.adminNotes = adminNotes;
  return this.save();
};

module.exports = mongoose.model('MarketplaceFlag', marketplaceFlagSchema);
