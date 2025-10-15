const mongoose = require('mongoose');

const buyerRatingSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  marketplaceItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Prevent duplicate ratings
buyerRatingSchema.index({ buyer: 1, seller: 1, marketplaceItem: 1 }, { unique: true });

module.exports = mongoose.model('BuyerRating', buyerRatingSchema);

