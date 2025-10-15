const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SellerRating = require('../models/SellerRating');
const MarketplaceItem = require('../models/MarketplaceItem');
const MarketplaceMessage = require('../models/MarketplaceMessage');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

// Get reviews written by the current user
router.get('/my-reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const ratings = await SellerRating.find({ reviewer: userId })
      .populate('seller', 'username name simpleId')
      .populate('reviewer', 'username name simpleId')
      .populate('marketplaceItem', 'title price images')
      .sort({ createdAt: -1 });
    
    res.json({ ratings });
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    res.status(500).json({ error: 'Failed to fetch your reviews' });
  }
});

// Get reviews for a specific seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    console.log('📊 [SellerRatings] Fetching reviews for seller:', sellerId);
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch all reviews for seller (approved)
    const ratings = await SellerRating.find({ seller: sellerId, status: 'approved' })
      .populate('reviewer', 'name username simpleId')
      .populate('marketplaceItem', 'title price images')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    console.log(`✅ [SellerRatings] Found ${ratings.length} reviews`);
    
    const total = await SellerRating.countDocuments({ seller: sellerId, status: 'approved' });
    
    // Get average rating - use new mongoose.Types.ObjectId
    let avgRatingResult = [];
    try {
      avgRatingResult = await SellerRating.aggregate([
        { $match: { seller: new mongoose.Types.ObjectId(sellerId), status: 'approved' } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);
    } catch (aggError) {
      console.warn('⚠️ Aggregate error, using simple average:', aggError.message);
      // Fallback: calculate average manually
      const simpleAvg = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
        : 0;
      avgRatingResult = [{ averageRating: simpleAvg, totalReviews: ratings.length }];
    }
    
    const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].averageRating : 0;
    const totalReviews = avgRatingResult.length > 0 ? avgRatingResult[0].totalReviews : 0;
    
    res.json({
      ratings: ratings, // Use 'ratings' instead of 'reviews'
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ [SellerRatings] Error fetching seller reviews:', error);
    res.status(500).json({ error: 'Failed to fetch seller reviews', details: error.message });
  }
});

// Get reviews for a specific marketplace item
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await SellerRating.getItemReviews(itemId, parseInt(limit), skip);
    const total = await SellerRating.countDocuments({ marketplaceItem: itemId, status: 'approved' });
    
    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching item reviews:', error);
    res.status(500).json({ error: 'Failed to fetch item reviews' });
  }
});

// Create a new review (authenticated users only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { sellerId, itemId, rating, comment, review, transactionCompleted } = req.body;
    const reviewerId = req.user.id || req.user._id;
    const reviewText = comment || review; // Accept both field names
    
    console.log('📝 [SellerRating] Creating review:', {
      reviewerId: reviewerId,
      sellerId: sellerId,
      itemId: itemId,
      rating: rating,
      reviewText: reviewText
    });
    
    // Validate required fields
    if (!sellerId || !itemId || !rating) {
      return res.status(400).json({ error: 'Seller ID, Item ID, and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Check if the item exists and belongs to the seller
    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (item.seller.toString() !== sellerId) {
      return res.status(400).json({ error: 'Item does not belong to the specified seller' });
    }
    
    // Check if user is trying to review their own item
    if (item.seller.toString() === reviewerId) {
      return res.status(400).json({ error: 'You cannot review your own item' });
    }
    
    // Create the review
    const newReview = new SellerRating({
      seller: sellerId,
      reviewer: reviewerId,
      marketplaceItem: itemId,
      rating,
      comment: reviewText || '',
      transactionCompleted: transactionCompleted || false
    });
    
    await newReview.save();
    
    // Update the marketplace message to mark buyer as rated
    await MarketplaceMessage.updateOne(
      {
        item: itemId,
        sender: reviewerId,
        recipient: sellerId,
        status: 'accepted',
        markedAsReceived: true
      },
      { buyerRated: true }
    );
    
    console.log('✅ [SellerRating] Updated buyerRated flag for marketplace message');
    
    // Update seller's average rating
    await updateSellerAverageRating(sellerId);
    
    // Populate the review data for response
    await newReview.populate([
      { path: 'reviewer', select: 'name username' },
      { path: 'marketplaceItem', select: 'title price' }
    ]);
    
    res.status(201).json({
      message: 'Review submitted successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.message.includes('already reviewed')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update a review (only by the reviewer)
router.put('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, transactionCompleted } = req.body;
    const userId = req.user.userId;
    
    const review = await SellerRating.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (review.reviewer.toString() !== userId) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }
    
    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }
    
    if (comment !== undefined) {
      review.comment = comment;
    }
    
    if (transactionCompleted !== undefined) {
      review.transactionCompleted = transactionCompleted;
    }
    
    await review.save();
    
    // Update seller's average rating
    await updateSellerAverageRating(review.seller);
    
    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review (only by the reviewer)
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;
    
    const review = await SellerRating.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (review.reviewer.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }
    
    const sellerId = review.seller;
    await SellerRating.findByIdAndDelete(reviewId);
    
    // Update seller's average rating
    await updateSellerAverageRating(sellerId);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Helper function to update seller's average rating
async function updateSellerAverageRating(sellerId) {
  try {
    const avgRatingResult = await SellerRating.getSellerAverageRating(sellerId);
    const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].averageRating : 0;
    const totalReviews = avgRatingResult.length > 0 ? avgRatingResult[0].totalReviews : 0;
    
    await User.findByIdAndUpdate(sellerId, {
      rating: Math.round(averageRating * 10) / 10,
      ratingCount: totalReviews
    });
  } catch (error) {
    console.error('Error updating seller average rating:', error);
  }
}

module.exports = router;
