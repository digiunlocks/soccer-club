const mongoose = require('mongoose');

const marketplaceReviewSchema = new mongoose.Schema({
  // The item being reviewed
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    required: true
  },
  
  // The buyer who is writing the review
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The seller being reviewed
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  
  // Review status
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
  
  // Buyer's response to seller's response
  buyerResponse: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Whether the transaction was completed
  transactionCompleted: {
    type: Boolean,
    default: true
  },
  
  // Admin notes if review is moderated
  adminNotes: {
    type: String,
    trim: true
  },
  
  // Additional review criteria (optional)
  criteria: {
    itemCondition: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    shipping: {
      type: Number,
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
marketplaceReviewSchema.index({ itemId: 1, status: 1 });
marketplaceReviewSchema.index({ buyerId: 1, status: 1 });
marketplaceReviewSchema.index({ sellerId: 1, status: 1 });
marketplaceReviewSchema.index({ rating: 1, status: 1 });

// Prevent duplicate reviews from same buyer for same item
marketplaceReviewSchema.index({ buyerId: 1, itemId: 1 }, { unique: true });

// Static method to get seller's average rating
marketplaceReviewSchema.statics.getSellerAverageRating = function(sellerId) {
  return this.aggregate([
    { $match: { sellerId: mongoose.Types.ObjectId(sellerId), status: 'approved' } },
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
marketplaceReviewSchema.statics.getSellerReviews = function(sellerId, limit = 10, skip = 0) {
  return this.find({ sellerId, status: 'approved' })
    .populate('buyerId', 'name username email')
    .populate('itemId', 'title price images')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get reviews for a specific marketplace item
marketplaceReviewSchema.statics.getItemReviews = function(itemId, limit = 10, skip = 0) {
  return this.find({ itemId, status: 'approved' })
    .populate('buyerId', 'name username email')
    .populate('sellerId', 'name username email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get user's reviews (as buyer or seller)
marketplaceReviewSchema.statics.getUserReviews = function(userId, role = 'both') {
  let query;
  if (role === 'buyer') {
    query = { buyerId: userId };
  } else if (role === 'seller') {
    query = { sellerId: userId };
  } else {
    query = { $or: [{ buyerId: userId }, { sellerId: userId }] };
  }
  
  return this.find(query)
    .populate('itemId', 'title price images')
    .populate('buyerId', 'name username email')
    .populate('sellerId', 'name username email')
    .sort({ createdAt: -1 });
};

// Pre-save middleware to ensure one review per buyer per item
marketplaceReviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({
      buyerId: this.buyerId,
      itemId: this.itemId
    });
    
    if (existingReview) {
      return next(new Error('You have already reviewed this item'));
    }
  }
  next();
});

module.exports = mongoose.model('MarketplaceReview', marketplaceReviewSchema);
