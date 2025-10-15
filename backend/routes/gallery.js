const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const GalleryItem = require('../models/GalleryItem');
const { auth: authenticateToken, superAdminAuth } = require('./auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/gallery');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Public routes - Get approved gallery items
router.get('/public', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const items = await GalleryItem.getPublicItems(category, parseInt(limit));
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching public gallery items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single gallery item (public)
router.get('/public/:id', async (req, res) => {
  try {
    const item = await GalleryItem.findOne({ 
      _id: req.params.id, 
      status: 'approved' 
    })
    .populate('author', 'username')
    .populate('comments.user', 'username')
    .populate('comments.flags.flaggedBy', 'username');

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Increment view count
    item.viewCount += 1;
    await item.save();

    res.json(item);
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload new gallery item (authenticated users)
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Process and save image
    const filename = `gallery_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    
    await sharp(req.file.buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    const imageUrl = `/uploads/gallery/${filename}`;

    // Create gallery item
    const galleryItem = new GalleryItem({
      title,
      description,
      imageUrl,
      category,
      author: req.user.id,
      authorName: req.user.username || req.user.email
    });

    await galleryItem.save();

    res.status(201).json({
      message: 'Gallery item uploaded successfully and pending approval',
      item: galleryItem
    });
  } catch (error) {
    console.error('Error uploading gallery item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Flag a gallery item (authenticated users)
router.post('/:id/flag', authenticateToken, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    const result = item.addFlag(req.user.id, reason, description);
    await item.save();

    res.json({ message: result.message });
  } catch (error) {
    console.error('Error flagging gallery item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Flag a gallery item (guest users - no authentication required)
router.post('/:id/flag-guest', async (req, res) => {
  try {
    const { reason, description } = req.body;
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // For guest users, we'll add a flag without a user ID
    // This will be tracked differently in the admin panel
    const guestFlag = {
      flaggedBy: null, // No user ID for guests
      reason,
      description: description || 'Flagged by guest user',
      flaggedAt: new Date(),
      isGuest: true
    };

    item.flags.push(guestFlag);
    item.flagCount = item.flags.length;
    
    // Check for auto-deletion (same logic as registered users)
    if (item.flagCount >= 3) {
      item.status = 'deleted';
    } else if (item.status === 'approved') {
      item.status = 'flagged';
    }

    await item.save();

    res.json({ 
      message: item.flagCount >= 3 
        ? 'Item flagged and auto-deleted due to multiple flags' 
        : 'Item flagged successfully'
    });
  } catch (error) {
    console.error('Error flagging gallery item (guest):', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Flag a comment (authenticated users)
router.post('/:id/comments/:commentId/flag', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    const result = item.flagComment(req.params.commentId, req.user.id, reason);
    await item.save();

    res.json({ message: result.message });
  } catch (error) {
    console.error('Error flagging comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to gallery item (authenticated users)
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (item.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot comment on non-approved items' });
    }

    item.comments.push({
      user: req.user.id,
      userName: req.user.username || req.user.email,
      content
    });

    await item.save();

    res.json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike gallery item (authenticated users)
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    const likeIndex = item.likes.indexOf(req.user.id);
    
    if (likeIndex > -1) {
      // Unlike
      item.likes.splice(likeIndex, 1);
    } else {
      // Like
      item.likes.push(req.user.id);
    }

    await item.save();

    res.json({ 
      message: likeIndex > -1 ? 'Unliked' : 'Liked',
      likeCount: item.likes.length 
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Get pending items for approval
router.get('/admin/pending', superAdminAuth, async (req, res) => {
  try {
    const items = await GalleryItem.getPendingItems();
    res.json(items);
  } catch (error) {
    console.error('Error fetching pending items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Get flagged items
router.get('/admin/flagged', superAdminAuth, async (req, res) => {
  try {
    const items = await GalleryItem.getFlaggedItems();
    res.json(items);
  } catch (error) {
    console.error('Error fetching flagged items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Approve gallery item
router.put('/admin/:id/approve', superAdminAuth, async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    item.status = 'approved';
    item.approvedBy = req.user.id;
    item.approvedAt = new Date();

    await item.save();

    res.json({ message: 'Gallery item approved successfully' });
  } catch (error) {
    console.error('Error approving gallery item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Reject gallery item
router.put('/admin/:id/reject', superAdminAuth, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    item.status = 'rejected';
    item.rejectionReason = rejectionReason;

    await item.save();

    res.json({ message: 'Gallery item rejected successfully' });
  } catch (error) {
    console.error('Error rejecting gallery item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Delete gallery item
router.delete('/admin/:id', superAdminAuth, async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete image file
    if (item.imageUrl) {
      const filepath = path.join(__dirname, '..', item.imageUrl);
      try {
        await fs.unlink(filepath);
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }

    await item.deleteOne();

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's gallery items
router.get('/user/my-items', authenticateToken, async (req, res) => {
  try {
    const items = await GalleryItem.find({ author: req.user.id })
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Error fetching user gallery items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Get all gallery items (for management)
router.get('/admin/all', superAdminAuth, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const items = await GalleryItem.find(query)
      .populate('author', 'username email')
      .populate('approvedBy', 'username')
      .populate('flags.flaggedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await GalleryItem.countDocuments(query);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all gallery items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 