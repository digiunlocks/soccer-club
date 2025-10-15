const express = require('express');
const router = express.Router();
const HeroTextSettings = require('../models/HeroTextSettings');
const { superAdminAuth } = require('./auth');

// Public route - Get hero text settings (no authentication required)
router.get('/public', async (req, res) => {
  try {
    // Find the most recent enabled settings
    let settings = await HeroTextSettings.findOne({ enabled: true }).sort({ updatedAt: -1 }).lean();
    
    console.log('🔍 Fetching hero text settings from /public');
    console.log('Settings found:', settings);
    
    if (!settings) {
      // If no enabled settings, try to find any settings
      settings = await HeroTextSettings.findOne().sort({ updatedAt: -1 }).lean();
      console.log('No enabled settings found, returning most recent:', settings);
    }
    
    if (!settings) {
      // Return default settings if none exist
      console.log('No settings in database, returning defaults');
      return res.json({
        caption: "Welcome to Our Soccer Club",
        subtitle: "Building Champions, Creating Memories",
        buttonText: "",
        buttonLink: "",
        enabled: false,
        textPosition: "center",
        textColor: "white",
        backgroundColor: "rgba(0,0,0,0.4)",
        fontSize: {
          caption: "clamp(2rem, 5vw, 4rem)",
          subtitle: "clamp(1rem, 2.5vw, 1.5rem)"
        }
      });
    }
    
    console.log('Returning settings:', settings);
    res.json(settings);
  } catch (err) {
    console.error('Error fetching hero text settings:', err);
    res.status(500).json({ error: 'Failed to fetch hero text settings' });
  }
});

// Get current hero text settings (admin only)
router.get('/', superAdminAuth, async (req, res) => {
  try {
    const settings = await HeroTextSettings.findOne().sort({ createdAt: -1 });
    if (!settings) {
      // Return default settings if none exist
      return res.json({
        caption: "Welcome to Our Soccer Club",
        subtitle: "Building Champions, Creating Memories",
        buttonText: "",
        buttonLink: "",
        enabled: false,
        textPosition: "center",
        textColor: "white",
        backgroundColor: "rgba(0,0,0,0.4)",
        fontSize: {
          caption: "clamp(2rem, 5vw, 4rem)",
          subtitle: "clamp(1rem, 2.5vw, 1.5rem)"
        }
      });
    }
    res.json(settings);
  } catch (err) {
    console.error('Error fetching hero text settings:', err);
    res.status(500).json({ error: 'Failed to fetch hero text settings' });
  }
});

// Update hero text settings (admin only)
router.put('/', superAdminAuth, async (req, res) => {
  try {
    console.log('Updating hero text settings:', req.body);
    
    // Find existing settings or create new
    let settings = await HeroTextSettings.findOne().sort({ createdAt: -1 });
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, req.body);
      await settings.save();
    } else {
      // Create new settings
      settings = new HeroTextSettings(req.body);
      await settings.save();
    }
    
    console.log('Updated settings:', settings);
    res.json(settings);
  } catch (err) {
    console.error('Error updating hero text settings:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

