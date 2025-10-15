const express = require('express');
const router = express.Router();
const HeroContent = require('../models/HeroContent');
const multer = require('multer');
const path = require('path');
const { superAdminAuth } = require('./auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, base + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Test route to verify the router is working (place first)
router.get('/test', (req, res) => {
  res.json({ message: 'Hero content router is working' });
});

// Public route - Get only visible hero content (no authentication required) - PLACE BEFORE /:id ROUTES
router.get('/public', async (req, res) => {
  try {
    console.log('Public hero content route accessed');
    const items = await HeroContent.find({ visible: true }).sort({ order: 1 });
    console.log('Found items:', items.length);
    res.json(items);
  } catch (err) {
    console.error('Error in public route:', err);
    res.status(500).json({ error: 'Failed to fetch hero content' });
  }
});

// Get slideshow settings (public)
router.get('/slideshow-settings', async (req, res) => {
  try {
    const slideshowItem = await HeroContent.findOne({ 
      visible: true, 
      displayMode: 'slideshow' 
    }).sort({ order: 1 });
    
    const settings = {
      interval: slideshowItem?.slideshowInterval || 5000, // Default to 5 seconds
      displayMode: slideshowItem?.displayMode || 'slideshow'
    };
    
    res.json(settings);
  } catch (err) {
    console.error('Error fetching slideshow settings:', err);
    res.status(500).json({ error: 'Failed to fetch slideshow settings' });
  }
});

// Upload endpoint (admin only) - PLACE BEFORE /:id ROUTES
router.post('/upload', superAdminAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Get all hero content (admin only - requires authentication)
router.get('/', superAdminAuth, async (req, res) => {
  try {
    const items = await HeroContent.find().sort({ order: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hero content' });
  }
});

// Add new hero content (admin only)
router.post('/', superAdminAuth, async (req, res) => {
  try {
    console.log('Creating new hero content:', req.body);
    const item = new HeroContent(req.body);
    await item.save();
    console.log('Created item:', item);
    res.status(201).json(item);
  } catch (err) {
    console.error('Error creating hero content:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update hero content (admin only)
router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    console.log('Updating hero content:', req.params.id, req.body);
    
    // Get the existing item first
    const existingItem = await HeroContent.findById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Hero content not found' });
    }
    
    // Prepare update data - only include fields that are provided
    const updateData = {};
    
    // Only update these fields if they're provided in the request
    if (req.body.caption !== undefined) updateData.caption = req.body.caption;
    if (req.body.subtitle !== undefined) updateData.subtitle = req.body.subtitle;
    if (req.body.buttonText !== undefined) updateData.buttonText = req.body.buttonText;
    if (req.body.buttonLink !== undefined) updateData.buttonLink = req.body.buttonLink;
    if (req.body.order !== undefined) updateData.order = req.body.order;
    if (req.body.visible !== undefined) updateData.visible = req.body.visible;
    if (req.body.slideshowInterval !== undefined) updateData.slideshowInterval = req.body.slideshowInterval;
    if (req.body.transitionEffect !== undefined) updateData.transitionEffect = req.body.transitionEffect;
    if (req.body.autoplay !== undefined) updateData.autoplay = req.body.autoplay;
    if (req.body.showControls !== undefined) updateData.showControls = req.body.showControls;
    
    // Only update media-related fields if they're provided
    if (req.body.url !== undefined && req.body.url.trim() !== '') {
      updateData.url = req.body.url;
    }
    if (req.body.type !== undefined && req.body.type.trim() !== '') {
      updateData.type = req.body.type;
    }
    if (req.body.mediaType !== undefined && req.body.mediaType.trim() !== '') {
      // Map mediaType to type for backward compatibility
      updateData.type = req.body.mediaType === 'video' ? 'video' : 'image';
    }
    
    console.log('Update data:', updateData);
    
    const item = await HeroContent.findByIdAndUpdate(req.params.id, updateData, { new: true });
    console.log('Updated item:', item);
    res.json(item);
  } catch (err) {
    console.error('Error updating hero content:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete hero content (admin only)
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    await HeroContent.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 