const mongoose = require('mongoose');

const heroContentSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
  caption: { type: String },
  subtitle: { type: String },
  buttonText: { type: String },
  buttonLink: { type: String },
  order: { type: Number, default: 0 },
  displayMode: { type: String, enum: ['slideshow', 'static', 'video'], default: 'slideshow' },
  visible: { type: Boolean, default: true },
  slideshowInterval: { type: Number, default: 5000, min: 1000, max: 30000 }, // milliseconds, 1-30 seconds
}, { timestamps: true });

module.exports = mongoose.model('HeroContent', heroContentSchema); 