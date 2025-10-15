const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'paypal', 'credit_card', 'other'],
    required: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  completedDate: Date,
  notes: String,
  // Review tracking
  itemReviewed: {
    type: Boolean,
    default: false
  },
  sellerReviewed: {
    type: Boolean,
    default: false
  },
  // Contact information for the transaction
  buyerContact: {
    phone: String,
    email: String
  },
  sellerContact: {
    phone: String,
    email: String
  },
  // Meeting details
  meetingLocation: String,
  meetingDate: Date,
  meetingTime: String
}, {
  timestamps: true
});

// Indexes for better performance
transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ item: 1, status: 1 });
transactionSchema.index({ transactionDate: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
