const express = require('express');
const router = express.Router();
const MarketplaceItem = require('../models/MarketplaceItem');
const MarketplaceMessage = require('../models/MarketplaceMessage');
const SellerRating = require('../models/SellerRating');
const BuyerRating = require('../models/BuyerRating');
const authenticateToken = require('../middleware/auth');

// Get user's items (including all statuses)
router.get('/my-items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const items = await MarketplaceItem.find({ seller: userId })
      .populate('seller', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    console.log(`📦 [MyItems] Found ${items.length} items for user ${userId}`);
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get offers received (on user's items)
router.get('/offers/received', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    // Get user's items
    const userItems = await MarketplaceItem.find({ seller: userId }).select('_id');
    const itemIds = userItems.map(item => item._id);
    
    // Get offers on user's items
    const offers = await MarketplaceMessage.find({
      item: { $in: itemIds },
      messageType: { $in: ['offer', 'counter_offer'] }
    })
    .populate('sender', 'username firstName lastName')
    .populate('item', 'title price images')
    .sort({ createdAt: -1 });
    
    res.json(offers);
  } catch (error) {
    console.error('Error fetching received offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Get offers made (by user)
router.get('/offers/made', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const offers = await MarketplaceMessage.find({
      sender: userId,
      messageType: { $in: ['offer', 'counter_offer'] }
    })
    .populate('recipient', 'username firstName lastName')
    .populate('item', 'title price images')
    .sort({ createdAt: -1 });
    
    res.json(offers);
  } catch (error) {
    console.error('Error fetching made offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Get seller ratings for user
router.get('/ratings/seller/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const ratings = await SellerRating.find({ seller: userId, status: 'approved' })
      .populate('reviewer', 'username firstName lastName')
      .populate('marketplaceItem', 'title price images')
      .sort({ createdAt: -1 });
    
    res.json({ ratings });
  } catch (error) {
    console.error('Error fetching seller ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Get buyer ratings for user
router.get('/ratings/buyer/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const ratings = await BuyerRating.find({ buyer: userId })
      .populate('seller', 'username firstName lastName')
      .populate('marketplaceItem', 'title price images')
      .sort({ createdAt: -1 });
    
    res.json({ ratings });
  } catch (error) {
    console.error('Error fetching buyer ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Respond to seller review
router.post('/ratings/seller/:ratingId/respond', authenticateToken, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { response } = req.body;
    const userId = req.user.id || req.user._id;
    
    const rating = await SellerRating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    
    // Check if user is the seller being reviewed
    if (rating.seller.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    rating.sellerResponse = response;
    await rating.save();
    
    res.json({ message: 'Response added successfully', rating });
  } catch (error) {
    console.error('Error adding seller response:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

// Respond to buyer review
router.post('/ratings/buyer/:ratingId/respond', authenticateToken, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { response } = req.body;
    const userId = req.user.id || req.user._id;
    
    const rating = await BuyerRating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    
    // Check if user is the buyer being reviewed
    if (rating.buyer.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    rating.buyerResponse = response;
    await rating.save();
    
    res.json({ message: 'Response added successfully', rating });
  } catch (error) {
    console.error('Error adding buyer response:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

module.exports = router;
