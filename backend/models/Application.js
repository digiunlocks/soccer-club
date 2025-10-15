const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  type: { type: String, enum: ['player', 'coach', 'referee', 'volunteer'], required: true },
  info: { type: Object, required: true }, // All form fields
  status: { type: String, enum: ['pending', 'approved', 'denied', 'rejected'], default: 'pending' },
  assignedTeam: { type: String },
  assignedRole: { type: String },
  teamPlacement: {
    team: { type: String },
    position: { type: String },
    jerseyNumber: { type: Number }
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  actionReason: { type: String },
  emailSent: { type: Boolean, default: false },
  notificationSent: { type: Boolean, default: false },
  notificationSentAt: { type: Date },
  correctionEmails: [{
    sentAt: { type: Date, default: Date.now },
    reason: { type: String },
    email: { type: String }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema); 