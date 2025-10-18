const mongoose = require('mongoose');

const enhancedRatingSchema = new mongoose.Schema({
  // Core rating data
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  marketplaceItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    required: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  
  // Rating details
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Rating categories (detailed breakdown)
  categories: {
    communication: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    itemCondition: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    shippingSpeed: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    }
  },
  
  // Verification and trust
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  
  // Response system
  sellerResponse: {
    type: String,
    trim: true,
    maxlength: 500
  },
  sellerResponseAt: {
    type: Date
  },
  
  buyerResponse: {
    type: String,
    trim: true,
    maxlength: 500
  },
  buyerResponseAt: {
    type: Date
  },
  
  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedAt: {
    type: Date
  },
  flagReason: {
    type: String,
    enum: ['inappropriate', 'fake', 'spam', 'harassment', 'other']
  },
  adminNotes: {
    type: String,
    trim: true
  },
  
  // Analytics
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportCount: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
enhancedRatingSchema.index({ seller: 1, status: 1 });
enhancedRatingSchema.index({ buyer: 1, status: 1 });
enhancedRatingSchema.index({ marketplaceItem: 1, status: 1 });
enhancedRatingSchema.index({ transaction: 1 });
enhancedRatingSchema.index({ rating: 1, status: 1 });
enhancedRatingSchema.index({ createdAt: -1 });

// Prevent duplicate ratings per transaction
enhancedRatingSchema.index({ 
  seller: 1, 
  buyer: 1, 
  transaction: 1 
}, { unique: true });

// Static method to get seller's comprehensive rating stats
enhancedRatingSchema.statics.getSellerRatingStats = async function(sellerId) {
  const stats = await this.aggregate([
    { 
      $match: { 
        seller: mongoose.Types.ObjectId(sellerId), 
        status: 'approved' 
      } 
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        averageCommunication: { $avg: '$categories.communication' },
        averageItemCondition: { $avg: '$categories.itemCondition' },
        averageShippingSpeed: { $avg: '$categories.shippingSpeed' },
        averageValueForMoney: { $avg: '$categories.valueForMoney' },
        verifiedReviews: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        },
        responseRate: {
          $sum: { $cond: [{ $ne: ['$sellerResponse', null] }, 1, 0] }
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      categoryAverages: {
        communication: 0,
        itemCondition: 0,
        shippingSpeed: 0,
        valueForMoney: 0
      },
      verifiedReviews: 0,
      responseRate: 0
    };
  }

  const result = stats[0];
  
  // Calculate rating distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  result.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    totalReviews: result.totalReviews,
    averageRating: Math.round(result.averageRating * 10) / 10,
    ratingDistribution: distribution,
    categoryAverages: {
      communication: Math.round(result.averageCommunication * 10) / 10,
      itemCondition: Math.round(result.averageItemCondition * 10) / 10,
      shippingSpeed: Math.round(result.averageShippingSpeed * 10) / 10,
      valueForMoney: Math.round(result.averageValueForMoney * 10) / 10
    },
    verifiedReviews: result.verifiedReviews,
    responseRate: Math.round((result.responseRate / result.totalReviews) * 100)
  };
};

// Static method to get recent rating trend
enhancedRatingSchema.statics.getRatingTrend = async function(sellerId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const recentRatings = await this.find({
    seller: sellerId,
    status: 'approved',
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 });

  if (recentRatings.length < 2) return 0;

  const firstHalf = recentRatings.slice(0, Math.floor(recentRatings.length / 2));
  const secondHalf = recentRatings.slice(Math.floor(recentRatings.length / 2));

  const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.rating, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.rating, 0) / secondHalf.length;

  return Math.round((secondHalfAvg - firstHalfAvg) * 10) / 10;
};

// Method to mark as verified
enhancedRatingSchema.methods.markAsVerified = function() {
  this.isVerified = true;
  this.verifiedAt = new Date();
  return this.save();
};

// Method to add helpful vote
enhancedRatingSchema.methods.addHelpfulVote = function(userId) {
  const existingVote = this.helpfulVotes.find(vote => 
    vote.user.toString() === userId.toString()
  );
  
  if (!existingVote) {
    this.helpfulVotes.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to report review
enhancedRatingSchema.methods.reportReview = function(reason) {
  this.reportCount += 1;
  if (this.reportCount >= 3) {
    this.status = 'flagged';
    this.flaggedAt = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('EnhancedRating', enhancedRatingSchema);
