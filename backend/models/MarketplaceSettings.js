const mongoose = require('mongoose');

const marketplaceSettingsSchema = new mongoose.Schema({
  // Expiration Settings
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
    max: 30,
    description: 'Days before expiration to send warning notification'
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
  
  // Pricing Tiers
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
  }],
  
  // Category-based Pricing
  categoryPricing: [{
    category: {
      type: String,
      required: true
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    extensionPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  // Free Listings
  freeListingsEnabled: {
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
  },
  
  // Auto-expiration
  autoExpireEnabled: {
    type: Boolean,
    default: true
  },
  autoDeleteExpiredAfterDays: {
    type: Number,
    default: 30,
    min: 0
  },
  
  // Notification Settings
  sendExpirationWarnings: {
    type: Boolean,
    default: true
  },
  sendExpiredNotifications: {
    type: Boolean,
    default: true
  },
  
  // General Settings
  requireApproval: {
    type: Boolean,
    default: true
  },
  maxImagesPerListing: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  
  // Last Updated
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
marketplaceSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({
      pricingTiers: [
        { name: 'Free - 30 Days', duration: 30, price: 0, description: 'Standard free listing' },
        { name: 'Basic - 60 Days', duration: 60, price: 5, description: 'Extended visibility' },
        { name: 'Premium - 90 Days', duration: 90, price: 10, description: 'Maximum exposure', featured: true }
      ],
      categoryPricing: [
        { category: 'Soccer Balls', basePrice: 0, extensionPrice: 2 },
        { category: 'Cleats', basePrice: 0, extensionPrice: 3 },
        { category: 'Jerseys', basePrice: 0, extensionPrice: 2 },
        { category: 'Training Equipment', basePrice: 0, extensionPrice: 5 },
        { category: 'Other', basePrice: 0, extensionPrice: 2 }
      ]
    });
  }
  return settings;
};

// Method to update settings
marketplaceSettingsSchema.statics.updateSettings = async function(updates, userId) {
  try {
    const settings = await this.getSettings();
    
    // Only update fields that exist in the schema
    const allowedFields = [
      'defaultExpirationDays', 'expirationWarningDays', 'allowExtensions',
      'extensionDays', 'maxExtensionsAllowed', 'freeListingsEnabled',
      'freeListingDuration', 'freeListingsPerUser', 'autoExpireEnabled',
      'autoDeleteExpiredAfterDays', 'sendExpirationWarnings', 'sendExpiredNotifications',
      'requireApproval', 'maxImagesPerListing'
    ];
    
    // Filter updates to only include allowed fields
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    Object.assign(settings, filteredUpdates);
    
    // Only set lastUpdatedBy if userId is provided and valid
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      settings.lastUpdatedBy = userId;
    }
    
    const savedSettings = await settings.save();
    console.log('✅ Settings updated successfully:', savedSettings._id);
    return savedSettings;
  } catch (error) {
    console.error('❌ Error in updateSettings:', error);
    throw error;
  }
};

// Method to get extension price for a category
marketplaceSettingsSchema.methods.getExtensionPrice = function(category) {
  const categoryPrice = this.categoryPricing.find(cp => cp.category === category);
  return categoryPrice ? categoryPrice.extensionPrice : 2; // Default price
};

// Method to get posting price for duration and category
marketplaceSettingsSchema.methods.getPostingPrice = function(duration, category) {
  // Check if free listings are enabled
  if (this.freeListingsEnabled && duration <= this.freeListingDuration) {
    return 0;
  }
  
  // Find matching pricing tier
  const tier = this.pricingTiers.find(t => t.duration === duration);
  if (tier) {
    return tier.price;
  }
  
  // Check category pricing
  const categoryPrice = this.categoryPricing.find(cp => cp.category === category);
  if (categoryPrice) {
    return categoryPrice.basePrice;
  }
  
  return 0; // Default to free
};

module.exports = mongoose.model('MarketplaceSettings', marketplaceSettingsSchema);

