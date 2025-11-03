const express = require('express');
const router = express.Router();
const MarketplaceSettings = require('../models/MarketplaceSettings');
const authenticateToken = require('../middleware/auth');
const checkAdmin = require('../middleware/admin');

// Get marketplace settings (public - for certain fields)
router.get('/', async (req, res) => {
  try {
    const settings = await MarketplaceSettings.getSettings();
    
    // Return only public-facing settings with safe access
    const publicSettings = {
      general: {
        siteName: settings.general?.siteName || 'Soccer Club Marketplace',
        siteDescription: settings.general?.siteDescription || 'Buy and sell soccer equipment',
        maintenanceMode: settings.general?.maintenanceMode || false,
        allowGuestBrowsing: settings.general?.allowGuestBrowsing !== false,
        maxImagesPerListing: settings.general?.maxImagesPerListing || 10,
        allowNegotiablePrices: settings.general?.allowNegotiablePrices !== false,
        enableMessaging: settings.general?.enableMessaging !== false,
        enableOffers: settings.general?.enableOffers !== false,
        enableFavorites: settings.general?.enableFavorites !== false,
        maxActiveListingsPerUser: settings.general?.maxActiveListingsPerUser || 50
      },
      ratings: {
        enableRatings: settings.ratings?.enableRatings !== false,
        ratingSystem: settings.ratings?.ratingSystem || '5-star',
        displayAverageRating: settings.ratings?.displayAverageRating !== false,
        displayRatingCount: settings.ratings?.displayRatingCount !== false,
        displayIndividualRatings: settings.ratings?.displayIndividualRatings !== false,
        displayRatingDistribution: settings.ratings?.displayRatingDistribution !== false,
        enableHelpfulVotes: settings.ratings?.enableHelpfulVotes !== false,
        sortRatingsBy: settings.ratings?.sortRatingsBy || 'recent'
      },
      reviews: {
        enableReviews: settings.reviews?.enableReviews !== false,
        minReviewLength: settings.reviews?.minReviewLength || 20,
        maxReviewLength: settings.reviews?.maxReviewLength || 2000,
        enableReviewImages: settings.reviews?.enableReviewImages !== false,
        maxReviewImages: settings.reviews?.maxReviewImages || 5,
        enableReviewVoting: settings.reviews?.enableReviewVoting !== false,
        reviewsPerPage: settings.reviews?.reviewsPerPage || 10,
        sortReviewsBy: settings.reviews?.sortReviewsBy || 'recent'
      },
      display: settings.display || {}
    };
    
    res.json(publicSettings);
  } catch (error) {
    console.error('Error fetching marketplace settings:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch marketplace settings', details: error.message });
  }
});

// Get full marketplace settings (admin only)
router.get('/admin', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('📥 [MarketplaceSettings] Fetching settings for admin');
    const settings = await MarketplaceSettings.getSettings();
    console.log('✅ [MarketplaceSettings] Settings retrieved successfully');
    res.json(settings);
  } catch (error) {
    console.error('❌ [MarketplaceSettings] Error fetching settings:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch marketplace settings', details: error.message });
  }
});

// Update marketplace settings (admin only)
router.put('/', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [MarketplaceSettings] Updating settings');
    
    const settings = await MarketplaceSettings.updateSettings(req.body, req.user._id);
    
    console.log('✅ [MarketplaceSettings] Settings updated successfully');
    res.json({ 
      message: 'Settings updated successfully', 
      settings 
    });
  } catch (error) {
    console.error('❌ [MarketplaceSettings] Update error:', error);
    
    let errorMessage = 'Failed to update settings';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
    }
    
    res.status(400).json({ error: errorMessage });
  }
});

// Reset marketplace settings to default (admin only)
router.post('/reset', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [MarketplaceSettings] Resetting settings to default');
    
    // Delete existing settings
    await MarketplaceSettings.deleteMany({});
    
    // Create new default settings
    const settings = await MarketplaceSettings.create({
      lastModifiedBy: req.user._id
    });
    
    console.log('✅ [MarketplaceSettings] Settings reset to default');
    res.json({ 
      message: 'Settings reset to default successfully', 
      settings 
    });
  } catch (error) {
    console.error('❌ [MarketplaceSettings] Reset error:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

// Get specific setting section (admin only)
router.get('/:section', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { section } = req.params;
    const settings = await MarketplaceSettings.getSettings();
    
    if (!settings[section]) {
      return res.status(404).json({ error: 'Setting section not found' });
    }
    
    res.json(settings[section]);
  } catch (error) {
    console.error('Error fetching setting section:', error);
    res.status(500).json({ error: 'Failed to fetch setting section' });
  }
});

// Update specific setting section (admin only)
router.put('/:section', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { section } = req.params;
    console.log(`🔧 [MarketplaceSettings] Updating ${section} section`);
    
    const settings = await MarketplaceSettings.getSettings();
    
    if (!settings[section]) {
      return res.status(404).json({ error: 'Setting section not found' });
    }
    
    settings[section] = { ...settings[section], ...req.body };
    settings.lastModifiedBy = req.user._id;
    await settings.save();
    
    console.log(`✅ [MarketplaceSettings] ${section} section updated`);
    res.json({ 
      message: `${section} settings updated successfully`, 
      settings: settings[section]
    });
  } catch (error) {
    console.error(`❌ [MarketplaceSettings] Update ${req.params.section} error:`, error);
    
    let errorMessage = `Failed to update ${req.params.section} settings`;
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
    }
    
    res.status(400).json({ error: errorMessage });
  }
});

// Export settings (admin only)
router.get('/export/json', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const settings = await MarketplaceSettings.getSettings();
    const settingsJSON = settings.toJSON();
    
    // Remove MongoDB specific fields
    delete settingsJSON._id;
    delete settingsJSON.__v;
    delete settingsJSON.createdAt;
    delete settingsJSON.updatedAt;
    delete settingsJSON.lastModifiedBy;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=marketplace-settings-${Date.now()}.json`);
    res.json(settingsJSON);
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({ error: 'Failed to export settings' });
  }
});

// Import settings (admin only)
router.post('/import', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [MarketplaceSettings] Importing settings');
    
    const settings = await MarketplaceSettings.updateSettings(req.body, req.user._id);
    
    console.log('✅ [MarketplaceSettings] Settings imported successfully');
    res.json({ 
      message: 'Settings imported successfully', 
      settings 
    });
  } catch (error) {
    console.error('❌ [MarketplaceSettings] Import error:', error);
    res.status(400).json({ error: 'Failed to import settings' });
  }
});

module.exports = router;
