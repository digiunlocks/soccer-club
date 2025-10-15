const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const MarketplaceItem = require('../models/MarketplaceItem');
const authenticateToken = require('../middleware/auth');
const checkAdmin = require('../middleware/admin');

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getActiveCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all categories for admin (including inactive)
router.get('/admin', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ sortOrder: 1, name: 1 })
      .populate('createdBy', 'username name')
      .populate('lastModifiedBy', 'username name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories for admin:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category with subcategories
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.getCategoryWithSubcategories(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category (admin only)
router.post('/', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Creating new category:', req.body);
    
    const categoryData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const category = new Category(categoryData);
    await category.save();
    
    console.log('✅ [Category] Category created:', category._id);
    res.status(201).json({ 
      message: 'Category created successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Create error:', error);
    
    let errorMessage = 'Failed to create category';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = 'Category name already exists';
    }
    
    res.status(400).json({ error: errorMessage });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Updating category:', req.params.id);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    Object.assign(category, req.body);
    category.lastModifiedBy = req.user._id;
    await category.save();
    
    console.log('✅ [Category] Category updated:', category._id);
    res.json({ 
      message: 'Category updated successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Update error:', error);
    
    let errorMessage = 'Failed to update category';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = 'Category name already exists';
    }
    
    res.status(400).json({ error: errorMessage });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Deleting category:', req.params.id);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if category has items
    const itemCount = await MarketplaceItem.countDocuments({ 
      category: category.name,
      status: { $nin: ['sold', 'expired'] }
    });
    
    if (itemCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. It has ${itemCount} active items. Please move or delete the items first.` 
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    console.log('✅ [Category] Category deleted:', req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('❌ [Category] Delete error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Add subcategory (admin only)
router.post('/:id/subcategories', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Adding subcategory to:', req.params.id);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await category.addSubcategory(req.body, req.user._id);
    
    console.log('✅ [Category] Subcategory added');
    res.json({ 
      message: 'Subcategory added successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Add subcategory error:', error);
    res.status(400).json({ error: 'Failed to add subcategory' });
  }
});

// Update subcategory (admin only)
router.put('/:id/subcategories/:subId', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Updating subcategory:', req.params.subId);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await category.updateSubcategory(req.params.subId, req.body, req.user._id);
    
    console.log('✅ [Category] Subcategory updated');
    res.json({ 
      message: 'Subcategory updated successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Update subcategory error:', error);
    res.status(400).json({ error: error.message || 'Failed to update subcategory' });
  }
});

// Delete subcategory (admin only)
router.delete('/:id/subcategories/:subId', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Deleting subcategory:', req.params.subId);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await category.deleteSubcategory(req.params.subId, req.user._id);
    
    console.log('✅ [Category] Subcategory deleted');
    res.json({ 
      message: 'Subcategory deleted successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Delete subcategory error:', error);
    res.status(400).json({ error: error.message || 'Failed to delete subcategory' });
  }
});

// Update item counts for all categories (admin only)
router.post('/update-counts', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Updating item counts for all categories');
    
    await Category.updateAllItemCounts();
    
    console.log('✅ [Category] Item counts updated');
    res.json({ message: 'Item counts updated successfully' });
  } catch (error) {
    console.error('❌ [Category] Update counts error:', error);
    res.status(500).json({ error: 'Failed to update item counts' });
  }
});

// Reorder categories (admin only)
router.put('/reorder', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Reordering categories');
    
    const { categoryOrders } = req.body;
    
    for (const { id, sortOrder } of categoryOrders) {
      await Category.findByIdAndUpdate(id, { sortOrder });
    }
    
    console.log('✅ [Category] Categories reordered');
    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('❌ [Category] Reorder error:', error);
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
});

// Update category pricing settings (admin only)
router.put('/:id/pricing', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Updating pricing settings for:', req.params.id);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const { pricingSettings } = req.body;
    category.pricingSettings = { ...category.pricingSettings, ...pricingSettings };
    category.lastModifiedBy = req.user._id;
    await category.save();
    
    console.log('✅ [Category] Pricing settings updated');
    res.json({ 
      message: 'Pricing settings updated successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Update pricing error:', error);
    res.status(400).json({ error: 'Failed to update pricing settings' });
  }
});

// Update category expiration settings (admin only)
router.put('/:id/expiration', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Updating expiration settings for:', req.params.id);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const { expirationSettings } = req.body;
    category.expirationSettings = { ...category.expirationSettings, ...expirationSettings };
    category.lastModifiedBy = req.user._id;
    await category.save();
    
    console.log('✅ [Category] Expiration settings updated');
    res.json({ 
      message: 'Expiration settings updated successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Update expiration error:', error);
    res.status(400).json({ error: 'Failed to update expiration settings' });
  }
});

// Update category free listing settings (admin only)
router.put('/:id/free-listings', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Updating free listing settings for:', req.params.id);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const { freeListingSettings } = req.body;
    category.freeListingSettings = { ...category.freeListingSettings, ...freeListingSettings };
    category.lastModifiedBy = req.user._id;
    await category.save();
    
    console.log('✅ [Category] Free listing settings updated');
    res.json({ 
      message: 'Free listing settings updated successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Update free listing error:', error);
    res.status(400).json({ error: 'Failed to update free listing settings' });
  }
});

// Add pricing tier to category (admin only)
router.post('/:id/pricing-tiers', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Adding pricing tier to:', req.params.id);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await category.addPricingTier(req.body, req.user._id);
    
    console.log('✅ [Category] Pricing tier added');
    res.json({ 
      message: 'Pricing tier added successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Add pricing tier error:', error);
    res.status(400).json({ error: 'Failed to add pricing tier' });
  }
});

// Update pricing tier (admin only)
router.put('/:id/pricing-tiers/:tierId', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Updating pricing tier:', req.params.tierId);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await category.updatePricingTier(req.params.tierId, req.body, req.user._id);
    
    console.log('✅ [Category] Pricing tier updated');
    res.json({ 
      message: 'Pricing tier updated successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Update pricing tier error:', error);
    res.status(400).json({ error: error.message || 'Failed to update pricing tier' });
  }
});

// Delete pricing tier (admin only)
router.delete('/:id/pricing-tiers/:tierId', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Category] Deleting pricing tier:', req.params.tierId);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await category.deletePricingTier(req.params.tierId, req.user._id);
    
    console.log('✅ [Category] Pricing tier deleted');
    res.json({ 
      message: 'Pricing tier deleted successfully', 
      category 
    });
  } catch (error) {
    console.error('❌ [Category] Delete pricing tier error:', error);
    res.status(400).json({ error: error.message || 'Failed to delete pricing tier' });
  }
});

// Get category pricing and expiration settings (public)
router.get('/:id/settings', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const settings = {
      pricing: category.getPricing(),
      expiration: category.getExpirationSettings(),
      freeListings: category.getFreeListingSettings()
    };
    
    res.json(settings);
  } catch (error) {
    console.error('❌ [Category] Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch category settings' });
  }
});

// Calculate posting price for category and duration (public)
router.post('/:id/calculate-price', async (req, res) => {
  try {
    const { duration } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const price = category.calculatePostingPrice(duration);
    
    res.json({ 
      category: category.name,
      duration,
      price,
      currency: 'USD'
    });
  } catch (error) {
    console.error('❌ [Category] Calculate price error:', error);
    res.status(500).json({ error: 'Failed to calculate price' });
  }
});

module.exports = router;
