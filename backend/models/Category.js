const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: /^#[0-9A-F]{6}$/i
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  subcategories: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    slug: {
      type: String,
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  itemCount: {
    type: Number,
    default: 0
  },
  
  // Pricing Settings
  pricingSettings: {
    enabled: {
      type: Boolean,
      default: false
    },
    basePrice: {
      type: Number,
      default: 0,
      min: 0
    },
    extensionPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    pricingTiers: [{
      name: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      description: String,
      featured: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Expiration Settings
  expirationSettings: {
    enabled: {
      type: Boolean,
      default: false
    },
    defaultExpirationDays: {
      type: Number,
      default: 30,
      min: 1,
      max: 365
    },
    expirationWarningDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 30
    },
    allowExtensions: {
      type: Boolean,
      default: true
    },
    extensionDays: {
      type: Number,
      default: 30,
      min: 1,
      max: 90
    },
    maxExtensionsAllowed: {
      type: Number,
      default: 3,
      min: 0,
      max: 10
    },
    autoExpireEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // Free Listing Settings
  freeListingSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    freeListingDuration: {
      type: Number,
      default: 30,
      min: 1
    },
    freeListingsPerUser: {
      type: Number,
      default: 3,
      min: 0
    }
  },
  
  // Notification Settings
  notificationSettings: {
    sendExpirationWarnings: {
      type: Boolean,
      default: true
    },
    sendExpiredNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ 'subcategories.name': 1 });

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Generate slugs for subcategories
  if (this.isModified('subcategories')) {
    this.subcategories.forEach(subcat => {
      if (!subcat.slug) {
        subcat.slug = subcat.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    });
  }
  
  next();
});

// Static method to get active categories with item counts
categorySchema.statics.getActiveCategories = async function() {
  return this.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .populate('createdBy', 'username name')
    .populate('lastModifiedBy', 'username name');
};

// Static method to get category with subcategories
categorySchema.statics.getCategoryWithSubcategories = async function(categoryId) {
  return this.findById(categoryId)
    .populate('createdBy', 'username name')
    .populate('lastModifiedBy', 'username name');
};

// Method to add subcategory
categorySchema.methods.addSubcategory = function(subcategoryData, userId) {
  const subcategory = {
    ...subcategoryData,
    slug: subcategoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    sortOrder: this.subcategories.length
  };
  
  this.subcategories.push(subcategory);
  this.lastModifiedBy = userId;
  return this.save();
};

// Method to update subcategory
categorySchema.methods.updateSubcategory = function(subcategoryId, updateData, userId) {
  const subcategory = this.subcategories.id(subcategoryId);
  if (subcategory) {
    Object.assign(subcategory, updateData);
    if (updateData.name) {
      subcategory.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    this.lastModifiedBy = userId;
    return this.save();
  }
  throw new Error('Subcategory not found');
};

// Method to delete subcategory
categorySchema.methods.deleteSubcategory = function(subcategoryId, userId) {
  this.subcategories.pull(subcategoryId);
  this.lastModifiedBy = userId;
  return this.save();
};

// Method to update item count
categorySchema.methods.updateItemCount = async function() {
  const MarketplaceItem = require('./MarketplaceItem');
  const count = await MarketplaceItem.countDocuments({ 
    category: this.name,
    status: { $in: ['approved', 'pending'] }
  });
  this.itemCount = count;
  return this.save();
};

// Static method to update all item counts
categorySchema.statics.updateAllItemCounts = async function() {
  const categories = await this.find({ isActive: true });
  const MarketplaceItem = require('./MarketplaceItem');
  
  for (const category of categories) {
    const count = await MarketplaceItem.countDocuments({ 
      category: category.name,
      status: { $in: ['approved', 'pending'] }
    });
    category.itemCount = count;
    await category.save();
  }
};

// Method to get pricing for this category
categorySchema.methods.getPricing = function() {
  if (!this.pricingSettings.enabled) {
    return {
      basePrice: 0,
      extensionPrice: 0,
      pricingTiers: []
    };
  }
  
  return {
    basePrice: this.pricingSettings.basePrice,
    extensionPrice: this.pricingSettings.extensionPrice,
    pricingTiers: this.pricingSettings.pricingTiers
  };
};

// Method to get expiration settings for this category
categorySchema.methods.getExpirationSettings = function() {
  if (!this.expirationSettings.enabled) {
    return null; // Use global settings
  }
  
  return {
    defaultExpirationDays: this.expirationSettings.defaultExpirationDays,
    expirationWarningDays: this.expirationSettings.expirationWarningDays,
    allowExtensions: this.expirationSettings.allowExtensions,
    extensionDays: this.expirationSettings.extensionDays,
    maxExtensionsAllowed: this.expirationSettings.maxExtensionsAllowed,
    autoExpireEnabled: this.expirationSettings.autoExpireEnabled
  };
};

// Method to get free listing settings for this category
categorySchema.methods.getFreeListingSettings = function() {
  if (!this.freeListingSettings.enabled) {
    return null; // Use global settings
  }
  
  return {
    freeListingDuration: this.freeListingSettings.freeListingDuration,
    freeListingsPerUser: this.freeListingSettings.freeListingsPerUser
  };
};

// Method to calculate posting price for duration
categorySchema.methods.calculatePostingPrice = function(duration) {
  if (!this.pricingSettings.enabled) {
    return 0; // Free if pricing not enabled
  }
  
  // Check if free listings are enabled and duration qualifies
  if (this.freeListingSettings.enabled && duration <= this.freeListingSettings.freeListingDuration) {
    return 0;
  }
  
  // Find matching pricing tier
  const tier = this.pricingSettings.pricingTiers.find(t => t.duration === duration);
  if (tier) {
    return tier.price;
  }
  
  // Return base price if no tier matches
  return this.pricingSettings.basePrice;
};

// Method to get extension price for this category
categorySchema.methods.getExtensionPrice = function() {
  if (!this.pricingSettings.enabled) {
    return 0;
  }
  return this.pricingSettings.extensionPrice;
};

// Method to add pricing tier
categorySchema.methods.addPricingTier = function(tierData, userId) {
  if (!this.pricingSettings.enabled) {
    this.pricingSettings.enabled = true;
  }
  
  this.pricingSettings.pricingTiers.push(tierData);
  this.lastModifiedBy = userId;
  return this.save();
};

// Method to update pricing tier
categorySchema.methods.updatePricingTier = function(tierId, updateData, userId) {
  const tier = this.pricingSettings.pricingTiers.id(tierId);
  if (tier) {
    Object.assign(tier, updateData);
    this.lastModifiedBy = userId;
    return this.save();
  }
  throw new Error('Pricing tier not found');
};

// Method to delete pricing tier
categorySchema.methods.deletePricingTier = function(tierId, userId) {
  this.pricingSettings.pricingTiers.pull(tierId);
  this.lastModifiedBy = userId;
  return this.save();
};

module.exports = mongoose.model('Category', categorySchema);
