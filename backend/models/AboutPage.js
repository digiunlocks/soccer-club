const mongoose = require('mongoose');

const aboutPageSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'About Seattle Leopards FC'
  },
  description: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: String,
    required: true
  },
  highlights: [{
    type: String,
    required: true
  }],
  gallery: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: 'Club scene'
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get the current about page content
aboutPageSchema.statics.getCurrent = async function() {
  let aboutPage = await this.findOne().sort({ createdAt: -1 });
  
  if (!aboutPage) {
    // Create default content if none exists
    aboutPage = new this({
      title: 'About Seattle Leopards FC',
      description: 'Seattle Leopards FC is dedicated to fostering a love for soccer in our community. We offer youth and adult teams, professional coaching, and a welcoming environment for players of all skill levels. Our mission is to build champions on and off the field, promote teamwork, and create lifelong memories.',
      additionalInfo: 'Join us for exciting matches, community events, and a chance to be part of the Leopards family. Whether you are a player, coach, referee, or volunteer, there is a place for you at Seattle Leopards FC.',
      highlights: [
        'Inclusive youth and adult teams',
        'Certified and passionate coaches',
        'Community outreach and events',
        'Modern facilities and equipment',
        'Pathways for players, coaches, and referees'
      ],
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          caption: 'Team training session',
          alt: 'Soccer team training',
          order: 0
        },
        {
          url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
          caption: 'Match day excitement',
          alt: 'Soccer match',
          order: 1
        },
        {
          url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
          caption: 'Community celebration',
          alt: 'Team celebration',
          order: 2
        }
      ]
    });
    await aboutPage.save();
  }
  
  return aboutPage;
};

module.exports = mongoose.model('AboutPage', aboutPageSchema);
