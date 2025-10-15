const mongoose = require('mongoose');

// Membership Tier Schema
const membershipTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1 // in months
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    included: {
      type: Boolean,
      default: true
    }
  }],
  benefits: [{
    title: String,
    description: String,
    icon: String
  }],
  maxMarketplaceListings: {
    type: Number,
    default: 0
  },
  prioritySupport: {
    type: Boolean,
    default: false
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Membership Schema
const membershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipTier',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending', 'suspended'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer', 'cash', 'other'],
    default: 'credit_card'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  discountApplied: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  transactionId: String,
  paymentReference: String,
  notes: String,
  renewalHistory: [{
    date: Date,
    amount: Number,
    status: String,
    transactionId: String
  }],
  suspensionReason: String,
  suspensionDate: Date,
  suspensionEndDate: Date,
  lastReminderSent: Date,
  reminderCount: {
    type: Number,
    default: 0
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
}, { timestamps: true });

// Membership Analytics Schema
const membershipAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  totalMembers: {
    type: Number,
    default: 0
  },
  activeMembers: {
    type: Number,
    default: 0
  },
  expiredMembers: {
    type: Number,
    default: 0
  },
  newMembers: {
    type: Number,
    default: 0
  },
  renewals: {
    type: Number,
    default: 0
  },
  cancellations: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  tierBreakdown: [{
    tier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipTier'
    },
    count: Number,
    revenue: Number
  }]
}, { timestamps: true });

// Pre-save middleware for slug generation
membershipTierSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Methods for Membership
membershipSchema.methods.isActive = function() {
  return this.status === 'active' && new Date() <= this.endDate;
};

membershipSchema.methods.isExpired = function() {
  return new Date() > this.endDate;
};

membershipSchema.methods.daysUntilExpiry = function() {
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

membershipSchema.methods.canRenew = function() {
  return this.status === 'active' || this.status === 'expired';
};

membershipSchema.methods.suspend = function(reason, endDate, userId) {
  this.status = 'suspended';
  this.suspensionReason = reason;
  this.suspensionDate = new Date();
  this.suspensionEndDate = endDate;
  this.lastModifiedBy = userId;
  return this.save();
};

membershipSchema.methods.unsuspend = function(userId) {
  this.status = 'active';
  this.suspensionReason = undefined;
  this.suspensionDate = undefined;
  this.suspensionEndDate = undefined;
  this.lastModifiedBy = userId;
  return this.save();
};

membershipSchema.methods.renew = function(months, userId) {
  const currentEndDate = this.endDate;
  const newEndDate = new Date(currentEndDate);
  newEndDate.setMonth(newEndDate.getMonth() + months);
  
  this.endDate = newEndDate;
  this.status = 'active';
  this.lastModifiedBy = userId;
  
  // Add to renewal history
  this.renewalHistory.push({
    date: new Date(),
    amount: this.amount,
    status: 'renewed',
    transactionId: `RENEW_${Date.now()}`
  });
  
  return this.save();
};

// Static methods for Membership
membershipSchema.statics.getActiveMemberships = function() {
  return this.find({
    status: 'active',
    endDate: { $gt: new Date() }
  }).populate('user tier');
};

membershipSchema.statics.getExpiringMemberships = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'active',
    endDate: { $lte: futureDate, $gt: new Date() }
  }).populate('user tier');
};

membershipSchema.statics.getMembershipStats = async function() {
  const now = new Date();
  
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalMembers: { $sum: 1 },
        activeMembers: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$status', 'active'] }, { $gt: ['$endDate', now] }] },
              1,
              0
            ]
          }
        },
        expiredMembers: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$status', 'active'] }, { $lte: ['$endDate', now] }] },
              1,
              0
            ]
          }
        },
        totalRevenue: { $sum: '$totalAmount' },
        monthlyRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$createdAt', new Date(now.getFullYear(), now.getMonth(), 1)] },
                  { $lt: ['$createdAt', new Date(now.getFullYear(), now.getMonth() + 1, 1)] }
                ]
              },
              '$totalAmount',
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  };
};

// Static methods for MembershipTier
membershipTierSchema.statics.getActiveTiers = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, price: 1 });
};

membershipTierSchema.statics.getPopularTiers = async function(limit = 5) {
  const popularTiers = await this.aggregate([
    {
      $lookup: {
        from: 'memberships',
        localField: '_id',
        foreignField: 'tier',
        as: 'memberships'
      }
    },
    {
      $addFields: {
        memberCount: { $size: '$memberships' },
        revenue: { $sum: '$memberships.totalAmount' }
      }
    },
    {
      $match: { isActive: true }
    },
    {
      $sort: { memberCount: -1 }
    },
    {
      $limit: limit
    }
  ]);
  
  return popularTiers;
};

// Indexes
membershipSchema.index({ user: 1, status: 1 });
membershipSchema.index({ endDate: 1, status: 1 });
membershipSchema.index({ tier: 1, status: 1 });
membershipSchema.index({ paymentStatus: 1 });
membershipSchema.index({ createdAt: -1 });

membershipTierSchema.index({ isActive: 1, sortOrder: 1 });
membershipTierSchema.index({ slug: 1 });

membershipAnalyticsSchema.index({ date: 1 });

// Create models
const MembershipTier = mongoose.model('MembershipTier', membershipTierSchema);
const Membership = mongoose.model('Membership', membershipSchema);
const MembershipAnalytics = mongoose.model('MembershipAnalytics', membershipAnalyticsSchema);

module.exports = {
  MembershipTier,
  Membership,
  MembershipAnalytics
};
