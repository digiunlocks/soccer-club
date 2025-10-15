const mongoose = require('mongoose');

const sellerRatingSchema = new mongoose.Schema({
  // Seller being rated
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // User who is rating
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Marketplace item this rating is for
  marketplaceItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    required: true
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Review comment
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Whether the transaction was completed
  transactionCompleted: {
    type: Boolean,
    default: false
  },
  
  // Status of the review
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  
  // Seller's response to the review
  sellerResponse: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Admin notes if review is moderated
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
sellerRatingSchema.index({ seller: 1, reviewer: 1, marketplaceItem: 1 }, { unique: true });
sellerRatingSchema.index({ seller: 1, status: 1 });
sellerRatingSchema.index({ marketplaceItem: 1 });

// Static method to get seller's average rating
sellerRatingSchema.statics.getSellerAverageRating = function(sellerId) {
  return this.aggregate([
    { $match: { seller: mongoose.Types.ObjectId(sellerId), status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get reviews for a seller
sellerRatingSchema.statics.getSellerReviews = function(sellerId, limit = 10, skip = 0) {
  return this.find({ seller: sellerId, status: 'approved' })
    .populate('reviewer', 'name username')
    .populate('marketplaceItem', 'title price')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get reviews for a specific marketplace item
sellerRatingSchema.statics.getItemReviews = function(itemId, limit = 10, skip = 0) {
  return this.find({ marketplaceItem: itemId, status: 'approved' })
    .populate('reviewer', 'name username')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Pre-save middleware to ensure one review per user per item
sellerRatingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({
      seller: this.seller,
      reviewer: this.reviewer,
      marketplaceItem: this.marketplaceItem
    });
    
    if (existingReview) {
      return next(new Error('You have already reviewed this seller for this item'));
    }
  }
  next();
});

module.exports = mongoose.model('SellerRating', sellerRatingSchema);
