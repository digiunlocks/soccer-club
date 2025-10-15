const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');
const { superAdminAuth } = require('./auth');

// Get all advertisements (admin only)
router.get('/', superAdminAuth, async (req, res) => {
  try {
    const { type, featured, visible, sort = 'createdAt', order = 'desc' } = req.query;
    
    let query = {};
    
    // Apply filters
    if (type) query.type = type;
    if (featured !== undefined) query.featured = featured === 'true';
    if (visible !== undefined) query.visible = visible === 'true';
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    const advertisements = await Advertisement.find(query)
      .sort(sortObj)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    res.json(advertisements);
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active advertisements (public)
router.get('/public', async (req, res) => {
  try {
    console.log('=== PUBLIC ADVERTISEMENTS ENDPOINT CALLED ===');
    
    const { type, limit } = req.query;
    console.log('Query parameters:', { type, limit });
    
    // Get active advertisements directly
    const advertisements = await Advertisement.getActive();
    console.log(`getActive() returned ${advertisements.length} advertisements`);
    
    if (advertisements.length > 0) {
      console.log('Sample advertisement:', {
        title: advertisements[0].title,
        type: advertisements[0].type,
        visible: advertisements[0].visible
      });
    }
    
    // Apply additional filters after getting the results
    let filteredAds = advertisements;
    
    if (type) {
      filteredAds = advertisements.filter(ad => ad.type === type);
      console.log(`After type filter (${type}): ${filteredAds.length} advertisements`);
    }
    
    if (limit) {
      filteredAds = filteredAds.slice(0, parseInt(limit));
      console.log(`After limit filter (${limit}): ${filteredAds.length} advertisements`);
    }
    
    // Increment view count for each advertisement
    filteredAds.forEach(ad => {
      ad.views += 1;
      ad.save().catch(err => console.error('Error updating view count:', err));
    });
    
    console.log(`Returning ${filteredAds.length} advertisements`);
    console.log('=== END PUBLIC ADVERTISEMENTS ENDPOINT ===');
    
    res.json(filteredAds);
  } catch (error) {
    console.error('Error fetching public advertisements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured advertisements (public)
router.get('/featured', async (req, res) => {
  try {
    const advertisements = await Advertisement.getFeatured();
    
    // Increment view count for each advertisement
    advertisements.forEach(ad => {
      ad.views += 1;
      ad.save().catch(err => console.error('Error updating view count:', err));
    });
    
    res.json(advertisements);
  } catch (error) {
    console.error('Error fetching featured advertisements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track advertisement click
router.post('/:id/click', async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    advertisement.clicks += 1;
    await advertisement.save();
    
    res.json({ message: 'Click tracked successfully' });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get advertisement by ID (admin only)
router.get('/:id', superAdminAuth, async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    res.json(advertisement);
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new advertisement (admin only)
router.post('/', superAdminAuth, async (req, res) => {
  try {
    const advertisement = new Advertisement({
      ...req.body,
      createdBy: req.user.id
    });
    
    await advertisement.save();
    
    const populatedAd = await advertisement.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);
    
    res.status(201).json(populatedAd);
  } catch (error) {
    console.error('Error creating advertisement:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update advertisement (admin only)
router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    Object.assign(advertisement, req.body, { updatedBy: req.user.id });
    await advertisement.save();
    
    const updatedAd = await advertisement.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);
    
    res.json(updatedAd);
  } catch (error) {
    console.error('Error updating advertisement:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete advertisement (admin only)
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    await advertisement.deleteOne();
    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk operations (admin only)
router.post('/bulk', superAdminAuth, async (req, res) => {
  try {
    const { action, ids, data } = req.body;
    
    if (!action || !ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    
    let result;
    
    switch (action) {
      case 'delete':
        result = await Advertisement.deleteMany({ _id: { $in: ids } });
        break;
      case 'update':
        result = await Advertisement.updateMany(
          { _id: { $in: ids } },
          { ...data, updatedBy: req.user.id }
        );
        break;
      case 'toggle-visibility':
        result = await Advertisement.updateMany(
          { _id: { $in: ids } },
          { $set: { visible: data.visible, updatedBy: req.user.id } }
        );
        break;
      case 'toggle-featured':
        result = await Advertisement.updateMany(
          { _id: { $in: ids } },
          { $set: { featured: data.featured, updatedBy: req.user.id } }
        );
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    
    res.json({ message: `Bulk operation completed: ${result.modifiedCount || result.deletedCount} items affected` });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get advertisement analytics (admin only)
router.get('/analytics/summary', superAdminAuth, async (req, res) => {
  try {
    const totalAds = await Advertisement.countDocuments();
    const visibleAds = await Advertisement.countDocuments({ visible: true });
    const featuredAds = await Advertisement.countDocuments({ featured: true });
    
    const totalViews = await Advertisement.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    const totalClicks = await Advertisement.aggregate([
      { $group: { _id: null, totalClicks: { $sum: '$clicks' } } }
    ]);
    
    const topPerforming = await Advertisement.find()
      .sort({ clicks: -1, views: -1 })
      .limit(5)
      .select('title type clicks views');
    
    const typeStats = await Advertisement.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalAds,
      visibleAds,
      featuredAds,
      totalViews: totalViews[0]?.totalViews || 0,
      totalClicks: totalClicks[0]?.totalClicks || 0,
      topPerforming,
      typeStats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 