const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  reason: { type: String },
  refundedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'processed' },
  admin: { type: String }, // Optionally store admin name/email
  refundType: { type: String, enum: ['full', 'partial'], default: 'partial' },
});

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  donorName: { type: String },
  donorEmail: { type: String },
  method: { type: String, enum: ['paypal', 'zelle', 'venmo', 'cashapp', 'card'], required: true },
  status: { type: String, enum: ['completed', 'pending', 'refunded', 'failed', 'partial'], default: 'completed' },
  transactionId: { type: String },
  refundedAt: { type: Date },
  refundReason: { type: String },
  notes: { type: String },
  refunds: [refundSchema], // Log of all refunds
  totalRefunded: { type: Number, default: 0 },
  cardType: { type: String },
  cardLast4: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema); 