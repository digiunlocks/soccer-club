const mongoose = require('mongoose');

const heroTextSettingsSchema = new mongoose.Schema({
  caption: { type: String, required: true },
  subtitle: { type: String },
  buttonText: { type: String },
  buttonLink: { type: String },
  enabled: { type: Boolean, default: true },
  textPosition: { 
    type: String, 
    enum: ['center', 'left', 'right'], 
    default: 'center' 
  },
  textColor: { type: String, default: 'white' },
  backgroundColor: { type: String, default: 'rgba(0,0,0,0.4)' },
  fontSize: { 
    caption: { type: String, default: 'clamp(2rem, 5vw, 4rem)' },
    subtitle: { type: String, default: 'clamp(1rem, 2.5vw, 1.5rem)' }
  }
}, { timestamps: true });

module.exports = mongoose.model('HeroTextSettings', heroTextSettingsSchema);

