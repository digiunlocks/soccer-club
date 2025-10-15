const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Content Type
  type: {
    type: String,
    enum: ['club-update', 'merchandise', 'other-club', 'community-event', 'league', 'training', 'tournament'],
    required: true
  },
  
  // Visual Content
  image: {
    type: String,
    trim: true
  },
  imageAlt: {
    type: String,
    trim: true
  },
  
  // Call to Action
  ctaText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  ctaLink: {
    type: String,
    required: true,
    trim: true
  },
  ctaType: {
    type: String,
    enum: ['internal', 'external'],
    default: 'internal'
  },
  
  // Event-specific fields
  eventDate: {
    type: Date
  },
  eventDateText: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  
  // Pricing and Commerce
  price: {
    type: String,
    trim: true
  },
  originalPrice: {
    type: String,
    trim: true
  },
  discount: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Badge and Status
  badge: {
    type: String,
    trim: true,
    maxlength: 30
  },
  badgeColor: {
    type: String,
    default: 'bg-green-500',
    enum: [
      'bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ]
  },
  
  // Display Settings
  visible: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  
  // Scheduling
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  
  // Targeting
  targetAudience: {
    type: [String],
    enum: ['players', 'parents', 'coaches', 'volunteers', 'all'],
    default: ['all']
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  // SEO
  seoTitle: {
    type: String,
    trim: true
  },
  seoDescription: {
    type: String,
    trim: true
  },
  
  // Organization/Club Info (for external content)
  organization: {
    name: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    logo: {
      type: String,
      trim: true
    }
  },
  
  // Created/Updated by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
advertisementSchema.index({ visible: 1, featured: 1, order: 1, priority: -1 });
advertisementSchema.index({ type: 1, visible: 1 });
advertisementSchema.index({ startDate: 1, endDate: 1, visible: 1 });
advertisementSchema.index({ tags: 1, visible: 1 });

// Virtual for click-through rate
advertisementSchema.virtual('ctr').get(function() {
  if (this.views === 0) return 0;
  return ((this.clicks / this.views) * 100).toFixed(2);
});

// Virtual for discount percentage
advertisementSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || !this.price) return null;
  const original = parseFloat(this.originalPrice.replace(/[^0-9.]/g, ''));
  const current = parseFloat(this.price.replace(/[^0-9.]/g, ''));
  if (original > current) {
    return Math.round(((original - current) / original) * 100);
  }
  return null;
});

// Method to check if advertisement is currently active
advertisementSchema.methods.isActive = function() {
  if (!this.visible) return false;
  
  const now = new Date();
  
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  return true;
};

// Static method to get active advertisements
advertisementSchema.statics.getActive = function() {
  return this.find({
    visible: true,
    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: new Date() } }
        ]
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: new Date() } }
        ]
      }
    ]
  }).sort({ featured: -1, order: 1, priority: -1, createdAt: -1 });
};

// Static method to get featured advertisements
advertisementSchema.statics.getFeatured = function() {
  return this.find({
    visible: true,
    featured: true,
    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: new Date() } }
        ]
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: new Date() } }
        ]
      }
    ]
  }).sort({ order: 1, priority: -1, createdAt: -1 }).limit(3);
};

// Pre-save middleware to update updatedBy
advertisementSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Advertisement', advertisementSchema); 