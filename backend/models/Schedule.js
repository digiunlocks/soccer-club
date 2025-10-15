const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'Practice', 'Game', 'Tournament', 'Tryout', 'Meeting', 'Training', 
      'Scrimmage', 'Friendly Match', 'Championship', 'Workshop'
    ]
  },
  team: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDays: [{
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }],
  recurringEndDate: {
    type: Date
  },
  maxParticipants: {
    type: Number,
    min: 1
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  requiresRegistration: {
    type: Boolean,
    default: false
  },
  coach: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  weatherDependent: {
    type: Boolean,
    default: false
  },
  equipment: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    min: 0
  },
  contactInfo: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'postponed', 'completed'],
    default: 'scheduled'
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  attendance: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present'
    },
    notes: String,
    recordedAt: {
      type: Date,
      default: Date.now
    }
  }],
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

// Index for efficient querying
scheduleSchema.index({ startDate: 1, team: 1 });
scheduleSchema.index({ eventType: 1 });
scheduleSchema.index({ location: 1 });
scheduleSchema.index({ isPublic: 1 });

// Virtual for full date-time
scheduleSchema.virtual('startDateTime').get(function() {
  if (this.startDate && this.startTime) {
    const date = new Date(this.startDate);
    const [hours, minutes] = this.startTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  }
  return null;
});

scheduleSchema.virtual('endDateTime').get(function() {
  if (this.startDate && this.endTime) {
    const date = new Date(this.startDate);
    const [hours, minutes] = this.endTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  }
  return null;
});

// Method to check if event is in the past
scheduleSchema.methods.isPast = function() {
  const now = new Date();
  const eventDate = new Date(this.startDate);
  const [hours, minutes] = this.startTime.split(':');
  eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return eventDate < now;
};

// Method to check if event is upcoming
scheduleSchema.methods.isUpcoming = function() {
  return !this.isPast();
};

// Static method to get upcoming events
scheduleSchema.statics.getUpcoming = function(limit = 10) {
  const now = new Date();
  return this.find({
    startDate: { $gte: now },
    status: 'scheduled'
  })
  .sort({ startDate: 1 })
  .limit(limit);
};

// Static method to get events by team
scheduleSchema.statics.getByTeam = function(team, options = {}) {
  const query = { team };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.dateFrom) {
    query.startDate = { $gte: new Date(options.dateFrom) };
  }
  
  if (options.dateTo) {
    if (query.startDate) {
      query.startDate.$lte = new Date(options.dateTo);
    } else {
      query.startDate = { $lte: new Date(options.dateTo) };
    }
  }
  
  return this.find(query).sort({ startDate: 1 });
};

module.exports = mongoose.model('Schedule', scheduleSchema); 