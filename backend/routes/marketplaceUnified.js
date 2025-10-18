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

// Mark item as sold
router.put('/my-items/:itemId/status', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status, soldPrice } = req.body;
    const userId = req.user.id;

    const item = await MarketplaceItem.findOne({ _id: itemId, seller: userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.status = status;
    if (status === 'sold' && soldPrice) {
      item.soldPrice = soldPrice;
      item.soldAt = new Date();
    }

    await item.save();
    res.json({ message: 'Item status updated successfully', item });
  } catch (error) {
    console.error('Error updating item status:', error);
    res.status(500).json({ message: 'Error updating item status' });
  }
});

// Repost item
router.post('/my-items/:itemId/repost', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const originalItem = await MarketplaceItem.findOne({ _id: itemId, seller: userId });
    if (!originalItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Prevent reposting sold items
    if (originalItem.status === 'sold') {
      return res.status(400).json({ message: 'Cannot repost sold items' });
    }

    // Create new item with same details but reset status and dates
    const newItem = new MarketplaceItem({
      title: originalItem.title,
      description: originalItem.description,
      price: originalItem.price,
      category: originalItem.category,
      condition: originalItem.condition,
      images: originalItem.images,
      seller: userId,
      status: 'pending', // Reset to pending for review
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await newItem.save();
    res.json({ message: 'Item reposted successfully', item: newItem });
  } catch (error) {
    console.error('Error reposting item:', error);
    res.status(500).json({ message: 'Error reposting item' });
  }
});

// Extend item listing
router.post('/my-items/:itemId/extend', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { days } = req.body;
    const userId = req.user.id;

    const item = await MarketplaceItem.findOne({ _id: itemId, seller: userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'approved') {
      return res.status(400).json({ message: 'Can only extend approved items' });
    }

    // Extend the expiration date
    const currentExpiry = item.expiresAt || new Date();
    item.expiresAt = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

    await item.save();
    res.json({ message: `Item extended by ${days} days`, item });
  } catch (error) {
    console.error('Error extending item:', error);
    res.status(500).json({ message: 'Error extending item' });
  }
});

module.exports = router;
