const mongoose = require('mongoose');

const financialTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed', 'refunded', 'cancelled'],
    default: 'completed'
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  payer: {
    type: String,
    trim: true
  },
  payee: {
    type: String,
    trim: true
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'],
    default: null
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

// Indexes for better performance
financialTransactionSchema.index({ type: 1, date: -1 });
financialTransactionSchema.index({ category: 1 });
financialTransactionSchema.index({ status: 1 });
financialTransactionSchema.index({ createdBy: 1 });

// Static method to get summary statistics
financialTransactionSchema.statics.getSummary = async function(startDate, endDate) {
  const query = {};
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  const [income, expense] = await Promise.all([
    this.aggregate([
      { $match: { ...query, type: 'income', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { ...query, type: 'expense', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ])
  ]);
  
  const totalIncome = income[0]?.total || 0;
  const totalExpense = expense[0]?.total || 0;
  const incomeCount = income[0]?.count || 0;
  const expenseCount = expense[0]?.count || 0;
  
  return {
    totalIncome,
    totalExpense,
    netIncome: totalIncome - totalExpense,
    incomeCount,
    expenseCount,
    totalTransactions: incomeCount + expenseCount
  };
};

// Static method to get category breakdown
financialTransactionSchema.statics.getCategoryBreakdown = async function(type, startDate, endDate) {
  const query = { type, status: 'completed' };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: query },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
};

module.exports = mongoose.model('FinancialTransaction', financialTransactionSchema);

