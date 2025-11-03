const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema({
  season: {
    type: String,
    required: true,
    trim: true
  },
  league: {
    type: String,
    required: true,
    trim: true
  },
  division: {
    type: String,
    trim: true
  },
  team: {
    type: String,
    required: true,
    trim: true
  },
  played: {
    type: Number,
    default: 0,
    min: 0
  },
  won: {
    type: Number,
    default: 0,
    min: 0
  },
  drawn: {
    type: Number,
    default: 0,
    min: 0
  },
  lost: {
    type: Number,
    default: 0,
    min: 0
  },
  goalsFor: {
    type: Number,
    default: 0,
    min: 0
  },
  goalsAgainst: {
    type: Number,
    default: 0,
    min: 0
  },
  goalDifference: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  position: {
    type: Number,
    min: 1
  },
  form: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate goal difference before saving
standingSchema.pre('save', function(next) {
  this.goalDifference = this.goalsFor - this.goalsAgainst;
  next();
});

// Static method to calculate points (3 for win, 1 for draw)
standingSchema.methods.calculatePoints = function() {
  this.points = (this.won * 3) + this.drawn;
  return this.points;
};

module.exports = mongoose.model('Standing', standingSchema);

