const express = require('express');
const router = express.Router();
const MarketplaceSettings = require('../models/MarketplaceSettings');
const authenticateToken = require('../middleware/auth');
const checkAdmin = require('../middleware/admin');

// Get current settings (public)
router.get('/', async (req, res) => {
  try {
    const settings = await MarketplaceSettings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching marketplace settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings (admin only)
router.put('/', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Settings] Update request received from:', req.user.username);
    console.log('🔧 [Settings] Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    
    // Ensure we have a valid user ID
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log('🔧 [Settings] Updating with user ID:', userId);
    
    const settings = await MarketplaceSettings.updateSettings(req.body, userId);
    
    console.log('✅ [Settings] Update successful');
    res.json({ 
      message: 'Settings updated successfully', 
      settings: settings,
      success: true 
    });
  } catch (error) {
    console.error('❌ [Settings] Update error:', error);
    console.error('❌ [Settings] Error stack:', error.stack);
    
    // More specific error messages
    let errorMessage = 'Failed to update settings';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid data format: ' + error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get extension price for a category (public)
router.get('/extension-price/:category', async (req, res) => {
  try {
    const settings = await MarketplaceSettings.getSettings();
    const price = settings.getExtensionPrice(req.params.category);
    res.json({ category: req.params.category, extensionPrice: price });
  } catch (error) {
    console.error('Error fetching extension price:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// Get posting price (public)
router.post('/posting-price', async (req, res) => {
  try {
    const { duration, category } = req.body;
    const settings = await MarketplaceSettings.getSettings();
    const price = settings.getPostingPrice(duration, category);
    res.json({ duration, category, postingPrice: price });
  } catch (error) {
    console.error('Error calculating posting price:', error);
    res.status(500).json({ error: 'Failed to calculate price' });
  }
});

// Add pricing tier (admin only)
router.post('/pricing-tier', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const settings = await MarketplaceSettings.getSettings();
    settings.pricingTiers.push(req.body);
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    res.json({ message: 'Pricing tier added', settings });
  } catch (error) {
    console.error('Error adding pricing tier:', error);
    res.status(500).json({ error: 'Failed to add pricing tier' });
  }
});

// Delete pricing tier (admin only)
router.delete('/pricing-tier/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const settings = await MarketplaceSettings.getSettings();
    settings.pricingTiers = settings.pricingTiers.filter(
      tier => tier._id.toString() !== req.params.id
    );
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    res.json({ message: 'Pricing tier deleted', settings });
  } catch (error) {
    console.error('Error deleting pricing tier:', error);
    res.status(500).json({ error: 'Failed to delete pricing tier' });
  }
});

// Update category pricing (admin only)
router.put('/category-pricing/:category', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const settings = await MarketplaceSettings.getSettings();
    const { basePrice, extensionPrice } = req.body;
    
    const categoryIndex = settings.categoryPricing.findIndex(
      cp => cp.category === req.params.category
    );
    
    if (categoryIndex >= 0) {
      settings.categoryPricing[categoryIndex].basePrice = basePrice;
      settings.categoryPricing[categoryIndex].extensionPrice = extensionPrice;
    } else {
      settings.categoryPricing.push({
        category: req.params.category,
        basePrice,
        extensionPrice
      });
    }
    
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    res.json({ message: 'Category pricing updated', settings });
  } catch (error) {
    console.error('Error updating category pricing:', error);
    res.status(500).json({ error: 'Failed to update category pricing' });
  }
});

// Fallback route for testing (remove in production)
router.put('/test', async (req, res) => {
  try {
    console.log('🧪 [Test] Update request received');
    console.log('🧪 [Test] Request body:', JSON.stringify(req.body, null, 2));
    
    const mongoose = require('mongoose');
    const settings = await MarketplaceSettings.updateSettings(req.body, new mongoose.Types.ObjectId());
    
    console.log('✅ [Test] Update successful');
    res.json({ 
      message: 'Settings updated successfully (test mode)', 
      settings: settings,
      success: true 
    });
  } catch (error) {
    console.error('❌ [Test] Update error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;

