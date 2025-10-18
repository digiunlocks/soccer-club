const mongoose = require('mongoose');

const marketplaceOfferSchema = new mongoose.Schema({
  // The item being offered on
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    required: true
  },
  
  // The buyer making the offer
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The seller receiving the offer
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Offer amount
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Offer message
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Offer status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired', 'withdrawn'],
    default: 'pending'
  },
  
  // Expiration date for the offer
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
  },
  
  // Counter offer amount (if seller makes a counter offer)
  counterOfferAmount: {
    type: Number,
    min: 0
  },
  
  // Counter offer message
  counterOfferMessage: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Whether this offer led to a sale
  resultedInSale: {
    type: Boolean,
    default: false
  },
  
  // Notes for internal use
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
marketplaceOfferSchema.index({ itemId: 1, status: 1 });
marketplaceOfferSchema.index({ buyerId: 1, status: 1 });
marketplaceOfferSchema.index({ sellerId: 1, status: 1 });
marketplaceOfferSchema.index({ expiresAt: 1 });

// Pre-save middleware to set expiration if not provided
marketplaceOfferSchema.pre('save', function(next) {
  if (!this.expiresAt && this.status === 'pending') {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }
  next();
});

// Static method to get offers for a specific item
marketplaceOfferSchema.statics.getItemOffers = function(itemId, status = null) {
  const query = { itemId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('buyerId', 'name email username')
    .populate('sellerId', 'name email username')
    .sort({ createdAt: -1 });
};

// Static method to get user's offers (as buyer or seller)
marketplaceOfferSchema.statics.getUserOffers = function(userId, role = 'both') {
  let query;
  if (role === 'buyer') {
    query = { buyerId: userId };
  } else if (role === 'seller') {
    query = { sellerId: userId };
  } else {
    query = { $or: [{ buyerId: userId }, { sellerId: userId }] };
  }
  
  return this.find(query)
    .populate('itemId', 'title price images status')
    .populate('buyerId', 'name email username')
    .populate('sellerId', 'name email username')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('MarketplaceOffer', marketplaceOfferSchema);
