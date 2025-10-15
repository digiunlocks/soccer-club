const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['game', 'practice', 'community', 'fan', 'other'],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  // Moderation fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged', 'deleted'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: 200
  },
  // Flagging system
  flags: [{
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Allow null for guest users
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'offensive', 'copyright', 'other'],
      required: true
    },
    description: {
      type: String,
      maxlength: 200
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    },
    isGuest: {
      type: Boolean,
      default: false
    }
  }],
  flagCount: {
    type: Number,
    default: 0
  },
  // Engagement metrics
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 300
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // Comment moderation
    status: {
      type: String,
      enum: ['active', 'flagged', 'deleted'],
      default: 'active'
    },
    flags: [{
      flaggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      reason: {
        type: String,
        enum: ['inappropriate', 'spam', 'offensive', 'other'],
        required: true
      },
      flaggedAt: {
        type: Date,
        default: Date.now
      }
    }],
    flagCount: {
      type: Number,
      default: 0
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
galleryItemSchema.index({ status: 1, createdAt: -1 });
galleryItemSchema.index({ author: 1 });
galleryItemSchema.index({ category: 1 });
galleryItemSchema.index({ flagCount: -1 });

// Virtual for like count
galleryItemSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count (only active comments)
galleryItemSchema.virtual('activeCommentCount').get(function() {
  return this.comments.filter(comment => comment.status === 'active').length;
});

// Method to check if auto-deletion should occur
galleryItemSchema.methods.checkAutoDeletion = function() {
  if (this.flagCount >= 3) {
    this.status = 'deleted';
    return true;
  }
  return false;
};

// Method to add a flag
galleryItemSchema.methods.addFlag = function(userId, reason, description = '') {
  // Check if user already flagged this item (only for registered users)
  if (userId) {
    const existingFlag = this.flags.find(flag => flag.flaggedBy && flag.flaggedBy.toString() === userId.toString());
    if (existingFlag) {
      return { success: false, message: 'You have already flagged this item' };
    }
  }

  this.flags.push({
    flaggedBy: userId,
    reason,
    description,
    isGuest: !userId
  });
  this.flagCount = this.flags.length;
  
  // Check for auto-deletion
  if (this.checkAutoDeletion()) {
    return { success: true, message: 'Item flagged and auto-deleted due to multiple flags' };
  }
  
  // Change status to flagged if not already flagged
  if (this.status === 'approved') {
    this.status = 'flagged';
  }
  
  return { success: true, message: 'Item flagged successfully' };
};

// Method to add a comment flag
galleryItemSchema.methods.flagComment = function(commentId, userId, reason) {
  const comment = this.comments.id(commentId);
  if (!comment) {
    return { success: false, message: 'Comment not found' };
  }

  // Check if user already flagged this comment
  const existingFlag = comment.flags.find(flag => flag.flaggedBy.toString() === userId.toString());
  if (existingFlag) {
    return { success: false, message: 'You have already flagged this comment' };
  }

  comment.flags.push({
    flaggedBy: userId,
    reason
  });
  comment.flagCount = comment.flags.length;

  // Auto-delete comment if it reaches 3 flags
  if (comment.flagCount >= 3) {
    comment.status = 'deleted';
    return { success: true, message: 'Comment flagged and auto-deleted due to multiple flags' };
  }

  // Change status to flagged if not already flagged
  if (comment.status === 'active') {
    comment.status = 'flagged';
  }

  return { success: true, message: 'Comment flagged successfully' };
};

// Static method to get approved items for public display
galleryItemSchema.statics.getPublicItems = function(category = null, limit = 20) {
  let query = { status: 'approved' };
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .populate('author', 'username email')
    .populate('comments.user', 'username')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get items pending approval
galleryItemSchema.statics.getPendingItems = function() {
  return this.find({ status: 'pending' })
    .populate('author', 'username email')
    .sort({ createdAt: -1 });
};

// Static method to get flagged items
galleryItemSchema.statics.getFlaggedItems = function() {
  return this.find({ 
    $or: [
      { status: 'flagged' },
      { 'comments.status': 'flagged' }
    ]
  })
    .populate('author', 'username email')
    .populate('comments.user', 'username')
    .populate('flags.flaggedBy', 'username')
    .sort({ flagCount: -1, createdAt: -1 });
};

module.exports = mongoose.model('GalleryItem', galleryItemSchema); 