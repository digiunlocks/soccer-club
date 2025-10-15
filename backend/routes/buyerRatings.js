const express = require('express');
const router = express.Router();
const BuyerRating = require('../models/BuyerRating');
const MarketplaceItem = require('../models/MarketplaceItem');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

// Create a buyer rating
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { buyerId, itemId, rating, review } = req.body;
    const sellerId = req.user.id || req.user._id;
    
    console.log('📝 [BuyerRating] Creating rating:', {
      sellerId: sellerId,
      buyerId: buyerId,
      itemId: itemId,
      rating: rating
    });
    
    if (!buyerId || !itemId || !rating) {
      return res.status(400).json({ error: 'Buyer ID, Item ID, and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Create the rating
    const newRating = new BuyerRating({
      buyer: buyerId,
      seller: sellerId,
      marketplaceItem: itemId,
      rating,
      comment: review || ''
    });
    
    await newRating.save();
    
    res.status(201).json({
      message: 'Buyer rated successfully',
      rating: newRating
    });
  } catch (error) {
    console.error('Error creating buyer rating:', error);
    res.status(500).json({ error: 'Failed to create rating' });
  }
});

// Get ratings for a buyer
router.get('/buyer/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params;
    
    console.log('📊 [BuyerRatings] Fetching ratings for buyer:', buyerId);
    
    const ratings = await BuyerRating.find({ buyer: buyerId })
      .populate('seller', 'username name simpleId')
      .populate('marketplaceItem', 'title price images')
      .sort({ createdAt: -1 });
    
    console.log(`✅ [BuyerRatings] Found ${ratings.length} ratings for buyer`);
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
    
    res.json({
      ratings,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('❌ [BuyerRatings] Error fetching buyer ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings', details: error.message });
  }
});

module.exports = router;

