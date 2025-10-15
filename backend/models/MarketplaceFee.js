const mongoose = require('mongoose');

const marketplaceFeeSchema = new mongoose.Schema({
  // Fee Types
  postingFee: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Fee charged for posting a new item'
  },
  extensionFee: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Fee charged for extending an item listing'
  },
  featuredFee: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Fee charged for featuring an item'
  },
  premiumFee: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Fee charged for premium placement'
  },
  
  // Fee Structure
  feeType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed',
    description: 'Whether fees are fixed amounts or percentages'
  },
  
  // Expiration Settings
  defaultExpirationDays: {
    type: Number,
    default: 90,
    min: 1,
    max: 365,
    description: 'Default expiration period in days'
  },
  extensionDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 90,
    description: 'Number of days added when extending'
  },
  maxExtensions: {
    type: Number,
    default: 3,
    min: 0,
    description: 'Maximum number of extensions allowed per item'
  },
  
  // Fee Waivers
  freePostingLimit: {
    type: Number,
    default: 3,
    min: 0,
    description: 'Number of free posts per user per month'
  },
  freeExtensionLimit: {
    type: Number,
    default: 1,
    min: 0,
    description: 'Number of free extensions per user per month'
  },
  
  // Currency
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD'],
    description: 'Currency for fees'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether fee system is active'
  },
  
  // Admin Settings
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Timestamps
  effectiveDate: {
    type: Date,
    default: Date.now,
    description: 'When these fees become effective'
  }
}, {
  timestamps: true
});

// Static method to get current active fees
marketplaceFeeSchema.statics.getCurrentFees = function() {
  return this.findOne({ isActive: true }).sort({ effectiveDate: -1 });
};

// Static method to create new fee configuration
marketplaceFeeSchema.statics.createNewFees = function(feeData, adminId) {
  // Deactivate current fees
  return this.updateMany({ isActive: true }, { isActive: false })
    .then(() => {
      // Create new fees
      return this.create({
        ...feeData,
        lastUpdatedBy: adminId,
        effectiveDate: new Date()
      });
    });
};

// Method to calculate posting fee for a user
marketplaceFeeSchema.methods.calculatePostingFee = function(userId, userPostCount) {
  if (userPostCount < this.freePostingLimit) {
    return 0; // Free posting
  }
  
  if (this.feeType === 'percentage') {
    // For percentage fees, we'd need the item price
    return null; // This would be calculated with item price
  }
  
  return this.postingFee;
};

// Method to calculate extension fee for a user
marketplaceFeeSchema.methods.calculateExtensionFee = function(userId, userExtensionCount) {
  if (userExtensionCount < this.freeExtensionLimit) {
    return 0; // Free extension
  }
  
  if (this.feeType === 'percentage') {
    // For percentage fees, we'd need the item price
    return null; // This would be calculated with item price
  }
  
  return this.extensionFee;
};

// Method to check if user can extend item
marketplaceFeeSchema.methods.canExtendItem = function(itemExtensions) {
  return itemExtensions < this.maxExtensions;
};

module.exports = mongoose.model('MarketplaceFee', marketplaceFeeSchema);
