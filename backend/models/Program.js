const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  zipCodes: [{ type: String }],
  address: { type: String },
  city: { type: String },
  state: { type: String },
  visible: { type: Boolean, default: true },
  contact: { type: String },
  website: { type: String },
  registrationLink: { type: String },
  assignedTeam: { type: String },
  assignedCoach: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema); 