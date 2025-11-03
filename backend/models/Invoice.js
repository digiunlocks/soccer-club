const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  clientPhone: {
    type: String,
    trim: true
  },
  clientAddress: {
    type: String,
    trim: true
  },
  invoiceType: {
    type: String,
    required: true,
    enum: ['registration', 'membership', 'tournament', 'training', 'equipment', 'other'],
    default: 'registration'
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  paidDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    default: 'Payment due within 30 days'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'credit_card', 'bank_transfer', 'paypal', 'stripe', 'other'],
    default: ''
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  sentAt: {
    type: Date
  },
  viewedAt: {
    type: Date
  },
  lastReminderSent: {
    type: Date
  },
  reminderCount: {
    type: Number,
    default: 0
  },
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

// Index for better query performance
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ clientEmail: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdBy: 1 });

// Virtual for checking if invoice is overdue
invoiceSchema.virtual('isOverdue').get(function() {
  return this.status !== 'paid' && this.status !== 'cancelled' && new Date() > this.dueDate;
});

// Pre-save middleware to calculate remaining amount
invoiceSchema.pre('save', function(next) {
  this.remainingAmount = this.total - this.paidAmount;
  
  // Auto-update status based on payment
  if (this.paidAmount >= this.total && this.status !== 'cancelled') {
    this.status = 'paid';
    this.paidDate = new Date();
  } else if (this.isOverdue && this.status === 'sent') {
    this.status = 'overdue';
  }
  
  next();
});

// Static method to generate invoice number
invoiceSchema.statics.generateInvoiceNumber = async function() {
  const year = new Date().getFullYear();
  const count = await this.countDocuments({
    invoiceNumber: { $regex: `^INV-${year}-` }
  });
  const number = (count + 1).toString().padStart(4, '0');
  return `INV-${year}-${number}`;
};

// Instance method to send invoice
invoiceSchema.methods.sendInvoice = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

// Instance method to mark as viewed
invoiceSchema.methods.markAsViewed = function() {
  if (this.status === 'sent') {
    this.status = 'viewed';
    this.viewedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to record payment
invoiceSchema.methods.recordPayment = function(amount, method = '') {
  this.paidAmount += amount;
  this.paymentMethod = method;
  if (this.paidAmount >= this.total) {
    this.status = 'paid';
    this.paidDate = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('Invoice', invoiceSchema);
