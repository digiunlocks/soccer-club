const mongoose = require('mongoose');

const marketplacePaymentSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Item Information (if applicable)
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceItem',
    required: false // Not required for general payments
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD']
  },
  
  // Payment Type
  paymentType: {
    type: String,
    enum: ['posting_fee', 'extension_fee', 'featured_fee', 'premium_fee', 'refund'],
    required: true
  },
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'wallet'],
    required: true
  },
  
  // External Payment Information
  externalPaymentId: {
    type: String,
    description: 'ID from payment processor (Stripe, PayPal, etc.)'
  },
  transactionId: {
    type: String,
    description: 'Internal transaction ID'
  },
  
  // Fee Configuration Reference
  feeConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceFee',
    required: true
  },
  
  // Additional Details
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Processing Information
  processedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Refund Information
  refundedAt: {
    type: Date
  },
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundReason: {
    type: String
  },
  refundAmount: {
    type: Number,
    min: 0
  },
  
  // Timestamps
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
marketplacePaymentSchema.index({ user: 1, createdAt: -1 });
marketplacePaymentSchema.index({ status: 1 });
marketplacePaymentSchema.index({ paymentType: 1 });
marketplacePaymentSchema.index({ externalPaymentId: 1 });
marketplacePaymentSchema.index({ transactionId: 1 });

// Virtual for payment status
marketplacePaymentSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for isRefundable
marketplacePaymentSchema.virtual('isRefundable').get(function() {
  return this.status === 'completed' && !this.refundedAt;
});

// Method to mark as completed
marketplacePaymentSchema.methods.markCompleted = function(externalPaymentId, processedBy) {
  this.status = 'completed';
  this.externalPaymentId = externalPaymentId;
  this.processedAt = new Date();
  this.processedBy = processedBy;
  return this.save();
};

// Method to mark as failed
marketplacePaymentSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.metadata.failureReason = reason;
  return this.save();
};

// Method to process refund
marketplacePaymentSchema.methods.processRefund = function(refundAmount, reason, refundedBy) {
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.refundedBy = refundedBy;
  this.refundReason = reason;
  this.refundAmount = refundAmount || this.amount;
  return this.save();
};

// Static method to get user payment history
marketplacePaymentSchema.statics.getUserPayments = function(userId, limit = 20, skip = 0) {
  return this.find({ user: userId })
    .populate('item', 'title price')
    .populate('feeConfig', 'postingFee extensionFee featuredFee')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get payment statistics
marketplacePaymentSchema.statics.getPaymentStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refundedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
        },
        refundedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, '$refundAmount', 0] }
        }
      }
    }
  ]);
};

// Static method to get payments by type
marketplacePaymentSchema.statics.getPaymentsByType = function(paymentType, startDate, endDate) {
  const matchStage = { paymentType };
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.find(matchStage)
    .populate('user', 'name username email')
    .populate('item', 'title price')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('MarketplacePayment', marketplacePaymentSchema);
