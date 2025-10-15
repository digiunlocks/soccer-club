const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const { auth: authenticateToken, superAdminAuth } = require('./auth');
const MarketplaceItem = require('../models/MarketplaceItem');
const User = require('../models/User');

const mongoose = require('mongoose');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/marketplace';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 images per item
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all marketplace items with advanced filtering
router.get('/public', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      brand,
      size,
      color,
      minPrice,
      maxPrice,
      condition,
      location,
      search,
      sort = 'newest'
    } = req.query;

    const query = { 
      status: { $in: ['approved', 'restored'] },
      $nor: [
        { status: 'flagged_for_review' },
        { status: 'removed_by_flags' }
      ]
    };

    // Apply filters
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = brand;
    if (size) query.size = size;
    if (color) query.color = color;
    if (condition) query.condition = condition;
    if (location) query.location = new RegExp(location, 'i');

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const items = await MarketplaceItem.find(query)
      .populate('seller', 'name username email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace items' });
  }
});

// Get featured items
router.get('/public/featured', async (req, res) => {
  try {
    const featuredItems = await MarketplaceItem.find({
      status: { $in: ['approved', 'restored'] },
      isFeatured: true,
      $nor: [
        { status: 'flagged_for_review' },
        { status: 'removed_by_flags' }
      ]
    })
    .populate('seller', 'name username email')
    .sort({ createdAt: -1 })
    .limit(8);

    res.json(featuredItems);
  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({ error: 'Failed to fetch featured items' });
  }
});

// Get trending items (most viewed in last 7 days)
router.get('/public/trending', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingItems = await MarketplaceItem.find({
      status: { $in: ['approved', 'restored'] },
      createdAt: { $gte: sevenDaysAgo },
      $nor: [
        { status: 'flagged_for_review' },
        { status: 'removed_by_flags' }
      ]
    })
    .populate('seller', 'name username email')
    .sort({ views: -1, createdAt: -1 })
    .limit(8);

    res.json(trendingItems);
  } catch (error) {
    console.error('Error fetching trending items:', error);
    res.status(500).json({ error: 'Failed to fetch trending items' });
  }
});

// Get categories and filters
router.get('/public/categories', async (req, res) => {
  try {
    const categories = await MarketplaceItem.distinct('category', { status: 'approved' });
    const subcategories = await MarketplaceItem.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: { category: '$category', subcategory: '$subcategory' } } },
      { $group: { _id: '$_id.category', subcategories: { $push: '$_id.subcategory' } } }
    ]);
    
    const brands = await MarketplaceItem.distinct('brand', { status: 'approved' });
    const sizes = await MarketplaceItem.distinct('size', { status: 'approved' });
    const colors = await MarketplaceItem.distinct('color', { status: 'approved' });

    res.json({
      categories,
      subcategories: subcategories.map(item => ({
        category: item._id,
        subcategories: item.subcategories
      })),
      brands: brands.filter(Boolean),
      sizes: sizes.filter(Boolean),
      colors: colors.filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get recommendations for logged-in user
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Get user's favorite categories and brands
    const userFavorites = await MarketplaceItem.find({
      _id: { $in: user.favorites || [] }
    }).select('category brand');

    const favoriteCategories = [...new Set(userFavorites.map(item => item.category))];
    const favoriteBrands = [...new Set(userFavorites.map(item => item.brand))];

    // Get recommendations based on user preferences
    const recommendations = await MarketplaceItem.find({
      status: 'approved',
      _id: { $nin: user.favorites || [] },
      $or: [
        { category: { $in: favoriteCategories } },
        { brand: { $in: favoriteBrands } }
      ]
    })
    .populate('seller', 'name username email')
    .sort({ rating: -1, views: -1 })
    .limit(8);

    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get user favorites
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const favoriteItems = await MarketplaceItem.find({
      _id: { $in: user.favorites || [] },
      status: 'approved'
    })
    .populate('seller', 'name username email')
    .sort({ createdAt: -1 });

    res.json(favoriteItems);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Get user's own items
router.get('/user/my-items', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const userItems = await MarketplaceItem.find({
      author: user._id
    })
    .populate('seller', 'name username email')
    .sort({ createdAt: -1 });

    res.json(userItems);
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ error: 'Failed to fetch user items' });
  }
});

// Get user's favorites (alternative endpoint path)
router.get('/user/favorites', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const favoriteItems = await MarketplaceItem.find({
      _id: { $in: user.favorites || [] },
      status: 'approved'
    })
    .populate('seller', 'name username email')
    .sort({ createdAt: -1 });

    res.json(favoriteItems);
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({ error: 'Failed to fetch user favorites' });
  }
});

// Toggle favorite
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user._id;

    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const user = req.user;
    const favorites = user.favorites || [];
    const isFavorite = favorites.includes(itemId);

    if (isFavorite) {
      // Remove from favorites
      user.favorites = favorites.filter(id => id.toString() !== itemId);
      await user.save();
      res.json({ message: 'Removed from favorites', isFavorite: false });
    } else {
      // Add to favorites
      user.favorites = [...favorites, itemId];
      await user.save();
      res.json({ message: 'Added to favorites', isFavorite: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

// Flag item (for logged-in users)
router.post('/:id/flag', authenticateToken, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const itemId = req.params.id;
    const userId = req.user._id;

    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Add flag to item
    item.flags.push({
      user: userId,
      reason,
      description,
      flaggedAt: new Date()
    });

    await item.save();

    res.json({ message: 'Item flagged successfully' });
  } catch (error) {
    console.error('Error flagging item:', error);
    res.status(500).json({ error: 'Failed to flag item' });
  }
});

// Flag item (for guests)
router.post('/:id/flag-guest', async (req, res) => {
  try {
    const { reason, description } = req.body;
    const itemId = req.params.id;

    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Add flag to item (without user reference)
    item.flags.push({
      reason,
      description,
      flaggedAt: new Date()
    });

    await item.save();

    res.json({ message: 'Item flagged successfully' });
  } catch (error) {
    console.error('Error flagging item:', error);
    res.status(500).json({ error: 'Failed to flag item' });
  }
});

// Increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const itemId = req.params.id;
    
    await MarketplaceItem.findByIdAndUpdate(itemId, {
      $inc: { views: 1 }
    });

    res.json({ message: 'View count updated' });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({ error: 'Failed to update view count' });
  }
});

// Get single item with enhanced details (by simpleId or ObjectId)
router.get('/public/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by simpleId first, then by ObjectId
    let item;
    if (id.length === 7 && /^[A-Z0-9]+$/.test(id)) {
      // Simple ID format
      item = await MarketplaceItem.findOne({ simpleId: id })
        .populate('seller', 'name username email createdAt simpleId _id');
    } else {
      // ObjectId format
      item = await MarketplaceItem.findById(id)
        .populate('seller', 'name username email createdAt simpleId _id');
    }
    
    console.log('📦 [GetItem] Fetched item:', {
      title: item?.title,
      sellerId: item?.seller?._id,
      sellerSimpleId: item?.seller?.simpleId,
      sellerName: item?.seller?.username
    });

    if (!item || item.status !== 'approved') {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Increment view count
    item.views = (item.views || 0) + 1;
    await item.save();

    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create new marketplace item
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      subcategory,
      brand,
      size,
      color,
      condition,
      location,
      isNegotiable,
      tags
    } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/marketplace/${file.filename}`) : [];

    const item = new MarketplaceItem({
      title,
      description,
      price: parseFloat(price),
      category,
      subcategory,
      brand,
      size,
      color,
      condition,
      location,
      isNegotiable: isNegotiable === 'true',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      images,
      seller: req.user._id,
      status: 'pending'
    });

    await item.save();

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating marketplace item:', error);
    res.status(500).json({ error: 'Failed to create marketplace item' });
  }
});

// Update marketplace item
router.put('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.seller.toString() !== req.user._id.toString() && !req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/marketplace/${file.filename}`);
      updateData.images = [...(item.images || []), ...newImages];
    }

    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    const updatedItem = await MarketplaceItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating marketplace item:', error);
    res.status(500).json({ error: 'Failed to update marketplace item' });
  }
});

// Delete marketplace item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.seller.toString() !== req.user._id.toString() && !req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await MarketplaceItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting marketplace item:', error);
    res.status(500).json({ error: 'Failed to delete marketplace item' });
  }
});

// Admin routes
router.get('/admin/all-items', superAdminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      category,
      search,
      sort = 'newest'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const items = await MarketplaceItem.find(query)
      .populate('seller', 'name username email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching admin items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get moderation queue (pending items)
router.get('/admin/moderation-queue', superAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await MarketplaceItem.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments({ status: 'pending' });
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
});

// Get restorable items (rejected/expired items)
router.get('/admin/restorable', superAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await MarketplaceItem.find({ 
      status: { $in: ['rejected', 'expired'] } 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments({ 
      status: { $in: ['rejected', 'expired'] } 
    });
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching restorable items:', error);
    res.status(500).json({ error: 'Failed to fetch restorable items' });
  }
});

// Get flagged items
router.get('/admin/flagged', superAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await MarketplaceItem.find({ 
      'flags.0': { $exists: true } 
    })
      .sort({ 'flags.flaggedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments({ 
      'flags.0': { $exists: true } 
    });
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching flagged items:', error);
    res.status(500).json({ error: 'Failed to fetch flagged items' });
  }
});

// Approve/Reject item
router.put('/admin/:id/status', superAdminAuth, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const itemId = req.params.id;

    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.status = status;
    if (reason) {
      item.adminNotes = reason;
    }

    await item.save();

    res.json({ message: `Item ${status} successfully`, item });
  } catch (error) {
    console.error('Error updating item status:', error);
    res.status(500).json({ error: 'Failed to update item status' });
  }
});

// Resolve flag
router.put('/admin/:id/resolve-flag', superAdminAuth, async (req, res) => {
  try {
    const { flagId, action } = req.body;
    const itemId = req.params.id;

    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Find and update the specific flag
    const flag = item.flags.id(flagId);
    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    flag.resolved = true;
    flag.resolvedBy = req.user._id;
    flag.resolvedAt = new Date();
    flag.resolution = action;

    await item.save();

    res.json({ message: 'Flag resolved successfully', item });
  } catch (error) {
    console.error('Error resolving flag:', error);
    res.status(500).json({ error: 'Failed to resolve flag' });
  }
});

// Get marketplace statistics
router.get('/admin/statistics', superAdminAuth, async (req, res) => {
  try {
    const stats = await MarketplaceItem.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          pendingItems: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedItems: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedItems: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          flaggedItems: {
            $sum: { $cond: [{ $gt: [{ $size: '$flags' }, 0] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalFavorites: { $sum: { $size: '$favorites' } }
        }
      }
    ]);

    res.json(stats[0] || {
      totalItems: 0,
      pendingItems: 0,
      approvedItems: 0,
      rejectedItems: 0,
      flaggedItems: 0,
      totalViews: 0,
      totalFavorites: 0
    });
  } catch (error) {
    console.error('Error fetching marketplace statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get pending items (alias for moderation-queue)
router.get('/admin/pending', superAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await MarketplaceItem.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments({ status: 'pending' });
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching pending items:', error);
    res.status(500).json({ error: 'Failed to fetch pending items' });
  }
});

// Get all items (alias for all-items)
router.get('/admin/all', superAdminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      subcategory,
      brand,
      size,
      color,
      minPrice,
      maxPrice,
      condition,
      location,
      search,
      sort = 'newest'
    } = req.query;

    const query = {};

    // Apply filters
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = brand;
    if (size) query.size = size;
    if (color) query.color = color;
    if (condition) query.condition = condition;
    if (location) query.location = new RegExp(location, 'i');

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await MarketplaceItem.find(query)
      .populate('seller', 'name username email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get stats (alias for statistics)
router.get('/admin/stats', superAdminAuth, async (req, res) => {
  try {
    const stats = await MarketplaceItem.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          pendingItems: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedItems: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedItems: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          flaggedItems: {
            $sum: { $cond: [{ $gt: [{ $size: '$flags' }, 0] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalFavorites: { $sum: { $size: '$favorites' } }
        }
      }
    ]);

    res.json(stats[0] || {
      totalItems: 0,
      pendingItems: 0,
      approvedItems: 0,
      rejectedItems: 0,
      flaggedItems: 0,
      totalViews: 0,
      totalFavorites: 0
    });
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Admin delete single item
router.delete('/admin/:id', superAdminAuth, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete associated images from filesystem
    if (item.images && item.images.length > 0) {
      item.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await MarketplaceItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting marketplace item:', error);
    res.status(500).json({ error: 'Failed to delete marketplace item' });
  }
});

// Admin bulk delete items
router.delete('/admin/bulk-delete', superAdminAuth, async (req, res) => {
  try {
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: 'Invalid item IDs provided' });
    }

    // Get items to delete their images
    const itemsToDelete = await MarketplaceItem.find({ _id: { $in: itemIds } });
    
    // Delete associated images from filesystem
    itemsToDelete.forEach(item => {
      if (item.images && item.images.length > 0) {
        item.images.forEach(imagePath => {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
    });

    // Delete items from database
    const result = await MarketplaceItem.deleteMany({ _id: { $in: itemIds } });

    res.json({ 
      message: `${result.deletedCount} item(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting marketplace items:', error);
    res.status(500).json({ error: 'Failed to delete marketplace items' });
  }
});

// Get user's own marketplace items
router.get('/my-items', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 12 } = req.query;
    
    const query = { seller: req.user.id };
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const items = await MarketplaceItem.find(query)
      .populate('seller', 'name username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await MarketplaceItem.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ error: 'Failed to fetch your items' });
  }
});

// Update item status (mark as sold, available, etc.)
router.put('/my-items/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, soldPrice, soldTo } = req.body;
    
    const item = await MarketplaceItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if user owns this item
    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own items' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'sold', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Update item
    item.status = status;
    
    if (status === 'sold') {
      item.soldAt = new Date();
      if (soldPrice) item.soldPrice = soldPrice;
      if (soldTo) item.soldTo = soldTo;
    }
    
    await item.save();
    
    res.json({ 
      message: 'Item status updated successfully',
      item: await MarketplaceItem.findById(id).populate('seller', 'name username email')
    });
  } catch (error) {
    console.error('Error updating item status:', error);
    res.status(500).json({ error: 'Failed to update item status' });
  }
});

// Delete user's own item
router.delete('/my-items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await MarketplaceItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if user owns this item
    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own items' });
    }
    
    // Delete associated images from filesystem
    if (item.images && item.images.length > 0) {
      item.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }
    
    // Delete item from database
    await MarketplaceItem.findByIdAndDelete(id);
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Get user's marketplace statistics
router.get('/my-items/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await MarketplaceItem.aggregate([
      { $match: { seller: req.user._id } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          pendingItems: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedItems: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          soldItems: {
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
          },
          expiredItems: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalFavorites: { $sum: { $size: '$favorites' } },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'sold'] }, '$soldPrice', 0]
            }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalItems: 0,
      pendingItems: 0,
      approvedItems: 0,
      soldItems: 0,
      expiredItems: 0,
      totalViews: 0,
      totalFavorites: 0,
      totalRevenue: 0
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Contact seller endpoint (send message or offer)
router.post('/:id/contact-seller', authenticateToken, async (req, res) => {
  console.log('\n========================================');
  console.log('🚀 CONTACT SELLER ENDPOINT CALLED');
  console.log('========================================');
  
  try {
    const { message, offerAmount } = req.body;
    const itemId = req.params.id;
    
    console.log('📨 1. REQUEST DETAILS:');
    console.log('   Item ID:', itemId);
    console.log('   Buyer ID:', req.user._id);
    console.log('   Buyer Username:', req.user.username);
    console.log('   Buyer Name:', req.user.name);
    console.log('   Message:', message);
    console.log('   Offer Amount:', offerAmount);
    
    if (!message || !message.trim()) {
      console.log('❌ VALIDATION FAILED: Message is required');
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Get the item and its seller
    console.log('\n📦 2. FETCHING ITEM...');
    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      console.log('❌ ITEM NOT FOUND:', itemId);
      return res.status(404).json({ message: 'Item not found' });
    }
    
    console.log('✅ Item found:');
    console.log('   Title:', item.title);
    console.log('   Seller ID:', item.seller);
    console.log('   Price:', item.price);
    
    // Prevent contacting yourself
    if (item.seller.toString() === req.user._id.toString()) {
      console.log('❌ BLOCKED: User trying to contact themselves');
      return res.status(400).json({ message: 'Cannot contact yourself' });
    }
    
    const MarketplaceMessage = require('../models/MarketplaceMessage');
    const Notification = require('../models/Notification');
    
    // Determine message type
    const messageType = offerAmount && offerAmount > 0 ? 'offer' : 'message';
    console.log('\n💬 3. MESSAGE TYPE:', messageType);
    
    // Create marketplace message
    console.log('\n📝 4. CREATING MARKETPLACE MESSAGE...');
    const marketplaceMessage = new MarketplaceMessage({
      item: itemId,
      sender: req.user._id,
      recipient: item.seller,
      messageType,
      content: message.trim(),
      offerAmount: offerAmount || null
    });
    
    await marketplaceMessage.save();
    console.log('✅ Marketplace message saved:', marketplaceMessage._id);
    
    await marketplaceMessage.populate('sender', 'username firstName lastName');
    await marketplaceMessage.populate('recipient', 'username firstName lastName');
    await marketplaceMessage.populate('item', 'title price');
    console.log('✅ Marketplace message populated');
    
    // Create notification for the seller
    console.log('\n🔔 5. CREATING NOTIFICATION...');
    console.log('   Notification type:', messageType === 'offer' ? 'negotiation_offer' : 'marketplace_inquiry');
    console.log('   Recipient (seller):', item.seller);
    console.log('   Sender (buyer):', req.user._id);
    console.log('   Item:', itemId);
    
    try {
      if (messageType === 'offer') {
        console.log('   → Creating OFFER notification');
        const notification = await Notification.createNotification(
          item.seller,
          req.user._id,
          'negotiation_offer',
          'New Offer Received',
          `${req.user.username || req.user.name || 'A buyer'} made an offer of $${offerAmount} on your item "${item.title}"`,
          itemId,
          null,
          {
            offerAmount: offerAmount,
            senderName: req.user.username || req.user.name,
            message: message.trim(),
            itemTitle: item.title,
            itemPrice: item.price
          }
        );
        
        console.log('✅✅✅ OFFER NOTIFICATION CREATED:', notification._id);
        console.log('   Notification details:');
        console.log('   - Type:', notification.type);
        console.log('   - Title:', notification.title);
        console.log('   - Recipient:', notification.recipient);
        console.log('   - Sender:', notification.sender);
        console.log('   - Read:', notification.read);
        console.log('   - Created:', notification.createdAt);
        
        // Verify notification was saved
        const verifyNotif = await Notification.findById(notification._id);
        if (verifyNotif) {
          console.log('✅ VERIFICATION: Notification exists in database');
        } else {
          console.log('❌ VERIFICATION FAILED: Notification not found after creation!');
        }
        
        // Check seller's notification count
        const sellerNotifCount = await Notification.countDocuments({ 
          recipient: item.seller 
        });
        console.log('📊 Seller now has', sellerNotifCount, 'total notifications');
        
        const unreadCount = await Notification.countDocuments({ 
          recipient: item.seller,
          read: false 
        });
        console.log('📊 Seller has', unreadCount, 'unread notifications');
        
      } else {
        console.log('   → Creating INQUIRY notification');
        const notification = await Notification.createNotification(
          item.seller,
          req.user._id,
          'marketplace_inquiry',
          'New Message About Your Item',
          `${req.user.username || req.user.name || 'Someone'} sent you a message about "${item.title}"`,
          itemId,
          null,
          {
            senderName: req.user.username || req.user.name,
            message: message.trim(),
            itemTitle: item.title
          }
        );
        
        console.log('✅✅✅ INQUIRY NOTIFICATION CREATED:', notification._id);
      }
    } catch (notifError) {
      console.error('❌❌❌ NOTIFICATION CREATION FAILED:');
      console.error('Error:', notifError.message);
      console.error('Stack:', notifError.stack);
      // Don't fail the request if notification fails
    }
    
    console.log('\n✅ 6. SENDING SUCCESS RESPONSE');
    console.log('========================================\n');
    
    res.status(201).json({ 
      message: 'Message sent successfully',
      data: marketplaceMessage
    });
  } catch (error) {
    console.error('\n❌❌❌ CONTACT SELLER ERROR:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.log('========================================\n');
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

module.exports = router;