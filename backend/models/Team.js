const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  ageGroup: {
    type: String,
    required: true,
    enum: ["Under 6", "Under 8", "Under 10", "Under 12", "Under 14", "Under 16", "Under 18", "Adult", "Women's", "Coed"]
  },
  level: {
    type: String,
    required: true,
    enum: ["Recreational", "Competitive", "Elite", "Development", "All-Star"]
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Inactive", "Forming", "Full", "Tryouts"],
    default: "Forming"
  },
  coach: {
    type: String,
    required: true,
    trim: true
  },
  assistantCoach: {
    type: String,
    trim: true,
    default: ""
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  currentPlayers: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  practiceDays: {
    type: String,
    required: true,
    trim: true
  },
  practiceTime: {
    type: String,
    required: true,
    trim: true
  },
  gameDay: {
    type: String,
    required: true,
    trim: true
  },
  gameTime: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  fees: {
    type: Number,
    required: true,
    min: 0
  },
  season: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  players: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      trim: true
    },
    jersey: {
      type: Number,
      min: 0,
      max: 99
    }
  }],
  visible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for player percentage
teamSchema.virtual('playerPercentage').get(function() {
  if (!this.maxPlayers) return 0;
  return Math.round((this.currentPlayers / this.maxPlayers) * 100);
});

// Ensure virtual fields are serialized
teamSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Team', teamSchema); 