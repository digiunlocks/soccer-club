const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  simpleId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Basic Information
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
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Categorization
  category: {
    type: String,
    required: true,
    enum: [
      'Soccer Balls', 'Cleats', 'Jerseys', 'Shorts', 'Socks', 'Gloves',
      'Shin Guards', 'Goalkeeper Gear', 'Training Equipment', 'Bags',
      'Accessories', 'Books & Media', 'Content', 'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'excellent', 'good', 'fair', 'poor']
  },
  
  // Location & Contact
  location: {
    type: String,
    required: true,
    trim: true
  },
  isNegotiable: {
    type: Boolean,
    default: false
  },
  
  // Media
  images: [{
    type: String,
    required: true
  }],
  
  // Tags for search
  tags: [{
    type: String,
    trim: true
  }],
  
  // Seller Information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status & Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'expired', 'flagged_for_review', 'removed_by_flags', 'restored'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flagCount: {
    type: Number,
    default: 0
  },
  flaggedForReviewAt: {
    type: Date,
    default: null
  },
  removedByFlagsAt: {
    type: Date,
    default: null
  },
  restoredAt: {
    type: Date,
    default: null
  },
  restoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date
  },
  
  // Engagement Metrics
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  
  // Flags & Reports
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'overpriced', 'other'],
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  
  // Featured & Promotional
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: {
    type: Date
  },
  
  // Transaction Details
  soldAt: {
    type: Date
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  soldPrice: {
    type: Number
  },
  
  // SEO & Analytics
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  
  // Fee Information
  postingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  extensionFee: {
    type: Number,
    default: 0,
    min: 0
  },
  totalFeesPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  extensionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastExtendedAt: {
    type: Date
  },
  
  // Timestamps
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
marketplaceItemSchema.index({ status: 1, createdAt: -1 });
marketplaceItemSchema.index({ category: 1, subcategory: 1 });
marketplaceItemSchema.index({ seller: 1 });
marketplaceItemSchema.index({ price: 1 });
marketplaceItemSchema.index({ location: 1 });
marketplaceItemSchema.index({ title: 'text', description: 'text', tags: 'text' });
marketplaceItemSchema.index({ isFeatured: 1, status: 1 });
marketplaceItemSchema.index({ views: -1 });
marketplaceItemSchema.index({ rating: -1 });

// Virtual for average rating
marketplaceItemSchema.virtual('averageRating').get(function() {
  return this.ratingCount > 0 ? this.rating / this.ratingCount : 0;
});

// Virtual for days remaining
marketplaceItemSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const expires = new Date(this.expiresAt);
  const diffTime = expires - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for isExpired
marketplaceItemSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Pre-save middleware to generate slug
marketplaceItemSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  if (this.isModified('title') || this.isModified('description')) {
    this.metaDescription = this.description.substring(0, 160);
  }
  
  next();
});

// Method to increment views
marketplaceItemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add rating
marketplaceItemSchema.methods.addRating = function(rating, userId) {
  // Check if user already rated
  const existingRating = this.ratings.find(r => r.user.toString() === userId.toString());
  
  if (existingRating) {
    // Update existing rating
    this.rating = this.rating - existingRating.rating + rating;
    existingRating.rating = rating;
    existingRating.updatedAt = new Date();
  } else {
    // Add new rating
    this.ratings.push({ user: userId, rating });
    this.rating += rating;
    this.ratingCount += 1;
  }
  
  return this.save();
};

// Method to toggle favorite
marketplaceItemSchema.methods.toggleFavorite = function(userId) {
  const index = this.favorites.indexOf(userId);
  
  if (index > -1) {
    this.favorites.splice(index, 1);
  } else {
    this.favorites.push(userId);
  }
  
  return this.save();
};

// Method to add flag
marketplaceItemSchema.methods.addFlag = function(flagData) {
  this.flags.push(flagData);
  return this.save();
};

// Static method to get trending items
marketplaceItemSchema.statics.getTrending = function(limit = 8) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return this.find({
    status: 'approved',
    createdAt: { $gte: sevenDaysAgo }
  })
  .sort({ views: -1, createdAt: -1 })
  .limit(limit)
  .populate('seller', 'name username email');
};

// Static method to get featured items
marketplaceItemSchema.statics.getFeatured = function(limit = 8) {
  return this.find({
    status: 'approved',
    isFeatured: true,
    $or: [
      { featuredUntil: { $gt: new Date() } },
      { featuredUntil: { $exists: false } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('seller', 'name username email');
};

// Static method to get recommendations
marketplaceItemSchema.statics.getRecommendations = function(userId, userFavorites, limit = 8) {
  const favoriteCategories = [...new Set(userFavorites.map(item => item.category))];
  const favoriteBrands = [...new Set(userFavorites.map(item => item.brand))];
  
  return this.find({
    status: 'approved',
    _id: { $nin: userFavorites.map(item => item._id) },
    $or: [
      { category: { $in: favoriteCategories } },
      { brand: { $in: favoriteBrands } }
    ]
  })
  .sort({ rating: -1, views: -1 })
  .limit(limit)
  .populate('seller', 'name username email');
};

// Static method to get categories with counts
marketplaceItemSchema.statics.getCategoriesWithCounts = function() {
  return this.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get price statistics
marketplaceItemSchema.statics.getPriceStats = function() {
  return this.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: null,
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalItems: { $sum: 1 }
      }
    }
  ]);
};

// Static method to search items
marketplaceItemSchema.statics.searchItems = function(searchQuery, filters = {}) {
  const query = { status: 'approved' };
  
  // Text search
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }
  
  // Apply filters
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      query[key] = filters[key];
    }
  });
  
  return this.find(query)
    .populate('seller', 'name username email')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 });
};

// Static method to get items by seller
marketplaceItemSchema.statics.getBySeller = function(sellerId, status = 'approved') {
  const query = { seller: sellerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('seller', 'name username email')
    .sort({ createdAt: -1 });
};

// Static method to get similar items
marketplaceItemSchema.statics.getSimilar = function(itemId, limit = 4) {
  return this.findById(itemId).then(item => {
    if (!item) return [];
    
    return this.find({
      _id: { $ne: itemId },
      status: 'approved',
      $or: [
        { category: item.category },
        { brand: item.brand },
        { tags: { $in: item.tags } }
      ]
    })
    .populate('seller', 'name username email')
    .sort({ rating: -1, views: -1 })
    .limit(limit);
  });
};

// Static method to clean up expired items
marketplaceItemSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    { 
      expiresAt: { $lt: new Date() },
      status: { $nin: ['sold', 'expired'] }
    },
    { status: 'expired' }
  );
};

// Static method to get marketplace statistics
marketplaceItemSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalViews: { $sum: '$views' },
        avgPrice: { $avg: '$price' },
        totalSold: {
          $sum: {
            $cond: [{ $eq: ['$status', 'sold'] }, 1, 0]
          }
        },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ['$status', 'sold'] }, '$soldPrice', 0]
          }
        },
        totalFeesCollected: { $sum: '$totalFeesPaid' }
      }
    }
  ]);
};

// Method to extend item expiration
marketplaceItemSchema.methods.extendExpiration = function(extensionDays, feeAmount) {
  const currentExpiration = new Date(this.expiresAt);
  const newExpiration = new Date(currentExpiration.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
  
  this.expiresAt = newExpiration;
  this.extensionCount += 1;
  this.extensionFee += feeAmount || 0;
  this.totalFeesPaid += feeAmount || 0;
  this.lastExtendedAt = new Date();
  
  return this.save();
};

// Method to check if item can be extended
marketplaceItemSchema.methods.canBeExtended = function(maxExtensions) {
  return this.extensionCount < maxExtensions && this.status === 'approved';
};

// Method to calculate days until expiration
marketplaceItemSchema.methods.getDaysUntilExpiration = function() {
  const now = new Date();
  const expires = new Date(this.expiresAt);
  const diffTime = expires - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Method to increment flag count and check for auto-removal
marketplaceItemSchema.methods.incrementFlagCount = async function() {
  this.flagCount += 1;
  
  // If flagged 3 or more times, mark for review
  if (this.flagCount >= 3 && this.status === 'approved') {
    this.status = 'flagged_for_review';
    this.flaggedForReviewAt = new Date();
  }
  
  return this.save();
};

// Method to restore item after admin review
marketplaceItemSchema.methods.restoreItem = async function(restoredBy) {
  this.status = 'restored';
  this.restoredAt = new Date();
  this.restoredBy = restoredBy;
  this.flagCount = 0; // Reset flag count
  return this.save();
};

// Method to permanently remove item due to flags
marketplaceItemSchema.methods.removeDueToFlags = async function() {
  this.status = 'removed_by_flags';
  this.removedByFlagsAt = new Date();
  return this.save();
};

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema); 



// Pre-save middleware to generate slug

marketplaceItemSchema.pre('save', function(next) {

  if (this.isModified('title')) {

    this.slug = this.title

      .toLowerCase()

      .replace(/[^a-z0-9]+/g, '-')

      .replace(/(^-|-$)/g, '');

  }

  

  if (this.isModified('title') || this.isModified('description')) {

    this.metaDescription = this.description.substring(0, 160);

  }

  

  next();

});



// Method to increment views

marketplaceItemSchema.methods.incrementViews = function() {

  this.views += 1;

  return this.save();

};



// Method to add rating

marketplaceItemSchema.methods.addRating = function(rating, userId) {

  // Check if user already rated

  const existingRating = this.ratings.find(r => r.user.toString() === userId.toString());

  

  if (existingRating) {

    // Update existing rating

    this.rating = this.rating - existingRating.rating + rating;

    existingRating.rating = rating;

    existingRating.updatedAt = new Date();

  } else {

    // Add new rating

    this.ratings.push({ user: userId, rating });

    this.rating += rating;

    this.ratingCount += 1;

  }

  

  return this.save();

};



// Method to toggle favorite

marketplaceItemSchema.methods.toggleFavorite = function(userId) {

  const index = this.favorites.indexOf(userId);

  

  if (index > -1) {

    this.favorites.splice(index, 1);

  } else {

    this.favorites.push(userId);

  }

  

  return this.save();

};



// Method to add flag

marketplaceItemSchema.methods.addFlag = function(flagData) {

  this.flags.push(flagData);

  return this.save();

};



// Static method to get trending items

marketplaceItemSchema.statics.getTrending = function(limit = 8) {

  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  

  return this.find({

    status: 'approved',

    createdAt: { $gte: sevenDaysAgo }

  })

  .sort({ views: -1, createdAt: -1 })

  .limit(limit)

  .populate('seller', 'name username email');

};



// Static method to get featured items

marketplaceItemSchema.statics.getFeatured = function(limit = 8) {

  return this.find({

    status: 'approved',

    isFeatured: true,

    $or: [

      { featuredUntil: { $gt: new Date() } },

      { featuredUntil: { $exists: false } }

    ]

  })

  .sort({ createdAt: -1 })

  .limit(limit)

  .populate('seller', 'name username email');

};



// Static method to get recommendations

marketplaceItemSchema.statics.getRecommendations = function(userId, userFavorites, limit = 8) {

  const favoriteCategories = [...new Set(userFavorites.map(item => item.category))];

  const favoriteBrands = [...new Set(userFavorites.map(item => item.brand))];

  

  return this.find({

    status: 'approved',

    _id: { $nin: userFavorites.map(item => item._id) },

    $or: [

      { category: { $in: favoriteCategories } },

      { brand: { $in: favoriteBrands } }

    ]

  })

  .sort({ rating: -1, views: -1 })

  .limit(limit)

  .populate('seller', 'name username email');

};



// Static method to get categories with counts

marketplaceItemSchema.statics.getCategoriesWithCounts = function() {

  return this.aggregate([

    { $match: { status: 'approved' } },

    { $group: { _id: '$category', count: { $sum: 1 } } },

    { $sort: { count: -1 } }

  ]);

};



// Static method to get price statistics

marketplaceItemSchema.statics.getPriceStats = function() {

  return this.aggregate([

    { $match: { status: 'approved' } },

    {

      $group: {

        _id: null,

        avgPrice: { $avg: '$price' },

        minPrice: { $min: '$price' },

        maxPrice: { $max: '$price' },

        totalItems: { $sum: 1 }

      }

    }

  ]);

};



// Static method to search items

marketplaceItemSchema.statics.searchItems = function(searchQuery, filters = {}) {

  const query = { status: 'approved' };

  

  // Text search

  if (searchQuery) {

    query.$text = { $search: searchQuery };

  }

  

  // Apply filters

  Object.keys(filters).forEach(key => {

    if (filters[key]) {

      query[key] = filters[key];

    }

  });

  

  return this.find(query)

    .populate('seller', 'name username email')

    .sort({ score: { $meta: 'textScore' }, createdAt: -1 });

};



// Static method to get items by seller

marketplaceItemSchema.statics.getBySeller = function(sellerId, status = 'approved') {

  const query = { seller: sellerId };

  if (status) query.status = status;

  

  return this.find(query)

    .populate('seller', 'name username email')

    .sort({ createdAt: -1 });

};



// Static method to get similar items

marketplaceItemSchema.statics.getSimilar = function(itemId, limit = 4) {

  return this.findById(itemId).then(item => {

    if (!item) return [];

    

    return this.find({

      _id: { $ne: itemId },

      status: 'approved',

      $or: [

        { category: item.category },

        { brand: item.brand },

        { tags: { $in: item.tags } }

      ]

    })

    .populate('seller', 'name username email')

    .sort({ rating: -1, views: -1 })

    .limit(limit);

  });

};



// Static method to clean up expired items

marketplaceItemSchema.statics.cleanupExpired = function() {

  return this.updateMany(

    { 

      expiresAt: { $lt: new Date() },

      status: { $nin: ['sold', 'expired'] }

    },

    { status: 'expired' }

  );

};



// Static method to get marketplace statistics

marketplaceItemSchema.statics.getStats = function() {

  return this.aggregate([

    {

      $group: {

        _id: null,

        totalItems: { $sum: 1 },

        totalViews: { $sum: '$views' },

        avgPrice: { $avg: '$price' },

        totalSold: {

          $sum: {

            $cond: [{ $eq: ['$status', 'sold'] }, 1, 0]

          }

        },

        totalRevenue: {

          $sum: {

            $cond: [{ $eq: ['$status', 'sold'] }, '$soldPrice', 0]

          }

        }

      }

    }

  ]);

};



module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema); 
