const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EnhancedRating = require('../models/EnhancedRating');
const Transaction = require('../models/Transaction');

// Get comprehensive rating stats for a seller
router.get('/seller/:sellerId/stats', auth, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const stats = await EnhancedRating.getSellerRatingStats(sellerId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    res.status(500).json({ message: 'Error fetching rating statistics' });
  }
});

// Get recent reviews for a seller
router.get('/seller/:sellerId/reviews', auth, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    
    const reviews = await EnhancedRating.find({
      seller: sellerId,
      status: 'approved'
    })
    .populate('buyer', 'username name')
    .populate('marketplaceItem', 'title price')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Get rating trend for a seller
router.get('/seller/:sellerId/trend', auth, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { days = 30 } = req.query;
    
    const trend = await EnhancedRating.getRatingTrend(sellerId, parseInt(days));
    res.json({ trend });
  } catch (error) {
    console.error('Error fetching rating trend:', error);
    res.status(500).json({ message: 'Error fetching rating trend' });
  }
});

// Submit a new rating
router.post('/submit', auth, async (req, res) => {
  try {
    const { 
      sellerId, 
      marketplaceItemId, 
      transactionId, 
      rating, 
      comment, 
      categories 
    } = req.body;
    
    const buyerId = req.user.id;
    
    // Verify transaction exists and user is involved
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.buyer.toString() !== buyerId && transaction.seller.toString() !== buyerId) {
      return res.status(403).json({ message: 'Not authorized to rate this transaction' });
    }
    
    // Check if transaction is completed
    if (transaction.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed transactions' });
    }
    
    // Check if user already rated this transaction
    const existingRating = await EnhancedRating.findOne({
      transaction: transactionId,
      $or: [
        { buyer: buyerId },
        { seller: buyerId }
      ]
    });
    
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this transaction' });
    }
    
    // Create new rating
    const newRating = new EnhancedRating({
      seller: sellerId,
      buyer: buyerId,
      marketplaceItem: marketplaceItemId,
      transaction: transactionId,
      rating,
      comment,
      categories: categories || {},
      isVerified: true // Auto-verify for completed transactions
    });
    
    await newRating.save();
    
    // Update transaction to mark as reviewed
    if (transaction.buyer.toString() === buyerId) {
      transaction.buyerReviewed = true;
    } else {
      transaction.sellerReviewed = true;
    }
    await transaction.save();
    
    res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});

// Add helpful vote to a review
router.post('/:ratingId/helpful', auth, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.id;
    
    const rating = await EnhancedRating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    await rating.addHelpfulVote(userId);
    res.json({ message: 'Vote added successfully' });
  } catch (error) {
    console.error('Error adding helpful vote:', error);
    res.status(500).json({ message: 'Error adding helpful vote' });
  }
});

// Report a review
router.post('/:ratingId/report', auth, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { reason } = req.body;
    
    const rating = await EnhancedRating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    await rating.reportReview(reason);
    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({ message: 'Error reporting review' });
  }
});

// Respond to a review (seller response)
router.post('/:ratingId/respond', auth, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { response } = req.body;
    const userId = req.user.id;
    
    const rating = await EnhancedRating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check if user is the seller
    if (rating.seller.toString() !== userId) {
      return res.status(403).json({ message: 'Only the seller can respond to reviews' });
    }
    
    rating.sellerResponse = response;
    rating.sellerResponseAt = new Date();
    await rating.save();
    
    res.json({ message: 'Response added successfully' });
  } catch (error) {
    console.error('Error adding seller response:', error);
    res.status(500).json({ message: 'Error adding response' });
  }
});

// Get rating distribution for analytics
router.get('/analytics/distribution', auth, async (req, res) => {
  try {
    const { sellerId, days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const distribution = await EnhancedRating.aggregate([
      {
        $match: {
          seller: sellerId ? mongoose.Types.ObjectId(sellerId) : { $exists: true },
          status: 'approved',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);
    
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching rating distribution:', error);
    res.status(500).json({ message: 'Error fetching rating distribution' });
  }
});

// Admin: Moderate reviews
router.put('/:ratingId/moderate', auth, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { status, adminNotes } = req.body;
    
    // Check if user is admin
    if (!req.user.isAdmin && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const rating = await EnhancedRating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    rating.status = status;
    rating.adminNotes = adminNotes;
    await rating.save();
    
    res.json({ message: 'Review moderated successfully' });
  } catch (error) {
    console.error('Error moderating review:', error);
    res.status(500).json({ message: 'Error moderating review' });
  }
});

module.exports = router;
