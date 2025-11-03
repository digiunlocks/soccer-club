const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payer Information
  payerName: {
    type: String,
    required: true,
    trim: true
  },
  payerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  payerPhone: {
    type: String,
    trim: true
  },
  
  // Payment Details
  paymentType: {
    type: String,
    enum: [
      'Registration Fees',
      'Membership Dues',
      'Tournament Fees',
      'Training Sessions',
      'Equipment Purchase',
      'Uniform Purchase',
      'Camp/Clinic Fees',
      'Merchandise',
      'Marketplace Purchase',
      'Donations',
      'Sponsorship',
      'Other'
    ],
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  paymentMethod: {
    type: String,
    enum: [
      'credit_card',
      'debit_card',
      'paypal',
      'venmo',
      'zelle',
      'cash_app',
      'bank_transfer',
      'check',
      'cash',
      'other'
    ],
    required: true
  },
  
  // Card Details (if applicable)
  cardType: {
    type: String,
    enum: ['Visa', 'Mastercard', 'American Express', 'Discover', 'Other', ''],
    default: ''
  },
  cardLastFour: {
    type: String,
    maxlength: 4
  },
  
  // Transaction Details
  transactionId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed', 'refunded', 'cancelled', 'partially_refunded'],
    default: 'pending'
  },
  
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Refund Information
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundReason: {
    type: String
  },
  refundDate: {
    type: Date
  },
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Additional Information
  notes: {
    type: String
  },
  
  // Related Entities
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedMembership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership'
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  relatedInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  
  // System Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Indexes for efficient querying
paymentSchema.index({ payerEmail: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentType: 1 });
paymentSchema.index({ transactionId: 1 });

// Virtual for net amount (amount - refund)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - (this.refundAmount || 0);
});

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
        completedPayments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
        refundedAmount: { $sum: '$refundAmount' },
        totalPayments: { $sum: 1 }
      }
    }
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayStats = await this.aggregate([
    { $match: { paymentDate: { $gte: today }, status: 'completed' } },
    {
      $group: {
        _id: null,
        todayRevenue: { $sum: '$amount' },
        todayCount: { $sum: 1 }
      }
    }
  ]);

  return {
    totalRevenue: stats[0]?.totalRevenue || 0,
    completedPayments: stats[0]?.completedPayments || 0,
    pendingAmount: stats[0]?.pendingAmount || 0,
    refundedAmount: stats[0]?.refundedAmount || 0,
    todayRevenue: todayStats[0]?.todayRevenue || 0,
    todayCount: todayStats[0]?.todayCount || 0
  };
};

// Instance method to process refund
paymentSchema.methods.processRefund = async function(amount, reason, userId) {
  if (amount > (this.amount - this.refundAmount)) {
    throw new Error('Refund amount exceeds available amount');
  }
  
  this.refundAmount += amount;
  this.refundReason = reason;
  this.refundDate = new Date();
  this.refundedBy = userId;
  
  if (this.refundAmount >= this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  await this.save();
  return this;
};

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
