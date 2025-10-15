const mongoose = require('mongoose');

const homepageContentSchema = new mongoose.Schema({
  // Welcome Section
  welcomeTitle: { type: String, required: true },
  welcomeSubtitle: { type: String, required: true },
  
  // Values
  values: [{
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
  
  // Programs
  programsTitle: { type: String, required: true },
  programsSubtitle: { type: String, required: true },
  programs: [{
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    features: [String],
    price: { type: String, required: true },
    link: { type: String, required: true }
  }],
  
  // Events
  eventsTitle: { type: String, required: true },
  eventsSubtitle: { type: String, required: true },
  events: [{
    date: { type: String, required: true },
    title: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    color: { type: String, required: true }
  }],
  
  // Teams
  teamsTitle: { type: String, required: true },
  teamsSubtitle: { type: String, required: true },
  teams: [{
    name: { type: String, required: true },
    division: { type: String, required: true },
    coach: { type: String, required: true },
    record: { type: String, required: true },
    color: { type: String, required: true },
    link: { type: String, required: true }
  }],
  
  // Stats
  stats: [{
    number: { type: String, required: true },
    label: { type: String, required: true }
  }],
  
  // Call to Action
  ctaTitle: { type: String, required: true },
  ctaSubtitle: { type: String, required: true },
  ctaButtons: [{
    text: { type: String, required: true },
    link: { type: String, required: true },
    primary: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('HomepageContent', homepageContentSchema);
