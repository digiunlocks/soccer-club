const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  tier: {
    type: String,
    enum: ['Platinum', 'Gold', 'Silver', 'Bronze', 'In-Kind'],
    default: 'Bronze'
  },
  amount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentFrequency: {
    type: String,
    enum: ['Annual', 'Quarterly', 'Monthly', 'One-Time'],
    default: 'Annual'
  },
  contractStart: {
    type: Date
  },
  contractEnd: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Expired', 'Cancelled'],
    default: 'Pending'
  },
  logo: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  benefits: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sponsor', sponsorSchema);

