const express = require('express');
const router = express.Router();
const { Membership, MembershipTier, MembershipAnalytics } = require('../models/Membership');
const authenticateToken = require('../middleware/auth');
const checkAdmin = require('../middleware/admin');

// ==================== MEMBERSHIP TIER ROUTES ====================

// Get all membership tiers (public)
router.get('/tiers', async (req, res) => {
  try {
    console.log('🔧 [Membership] Fetching membership tiers');
    
    const tiers = await MembershipTier.getActiveTiers();
    
    console.log('✅ [Membership] Found', tiers.length, 'tiers');
    res.json(tiers);
  } catch (error) {
    console.error('❌ [Membership] Error fetching tiers:', error);
    res.status(500).json({ error: 'Failed to fetch membership tiers' });
  }
});

// Get membership tier by ID (public)
router.get('/tiers/:id', async (req, res) => {
  try {
    const tier = await MembershipTier.findById(req.params.id);
    
    if (!tier) {
      return res.status(404).json({ error: 'Membership tier not found' });
    }
    
    res.json(tier);
  } catch (error) {
    console.error('❌ [Membership] Error fetching tier:', error);
    res.status(500).json({ error: 'Failed to fetch membership tier' });
  }
});

// Create membership tier (admin only)
router.post('/tiers', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Creating new tier:', req.body.name);
    
    const tierData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const tier = new MembershipTier(tierData);
    await tier.save();
    
    console.log('✅ [Membership] Tier created:', tier.name);
    res.status(201).json({ message: 'Membership tier created successfully', tier });
  } catch (error) {
    console.error('❌ [Membership] Error creating tier:', error);
    res.status(400).json({ error: 'Failed to create membership tier' });
  }
});

// Update membership tier (admin only)
router.put('/tiers/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Updating tier:', req.params.id);
    
    const tier = await MembershipTier.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    if (!tier) {
      return res.status(404).json({ error: 'Membership tier not found' });
    }
    
    console.log('✅ [Membership] Tier updated:', tier.name);
    res.json({ message: 'Membership tier updated successfully', tier });
  } catch (error) {
    console.error('❌ [Membership] Error updating tier:', error);
    res.status(400).json({ error: 'Failed to update membership tier' });
  }
});

// Delete membership tier (admin only)
router.delete('/tiers/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Deleting tier:', req.params.id);
    
    // Check if tier has active memberships
    const activeMemberships = await Membership.countDocuments({
      tier: req.params.id,
      status: 'active'
    });
    
    if (activeMemberships > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete tier with active memberships',
        activeMemberships 
      });
    }
    
    const tier = await MembershipTier.findByIdAndDelete(req.params.id);
    
    if (!tier) {
      return res.status(404).json({ error: 'Membership tier not found' });
    }
    
    console.log('✅ [Membership] Tier deleted:', tier.name);
    res.json({ message: 'Membership tier deleted successfully' });
  } catch (error) {
    console.error('❌ [Membership] Error deleting tier:', error);
    res.status(500).json({ error: 'Failed to delete membership tier' });
  }
});

// Get popular tiers (public)
router.get('/tiers/popular/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;
    const popularTiers = await MembershipTier.getPopularTiers(limit);
    
    res.json(popularTiers);
  } catch (error) {
    console.error('❌ [Membership] Error fetching popular tiers:', error);
    res.status(500).json({ error: 'Failed to fetch popular tiers' });
  }
});

// ==================== MEMBERSHIP ROUTES ====================

// Get user's memberships
router.get('/my-memberships', authenticateToken, async (req, res) => {
  try {
    console.log('🔧 [Membership] Fetching memberships for user:', req.user.username);
    
    const memberships = await Membership.find({ user: req.user._id })
      .populate('tier')
      .sort({ createdAt: -1 });
    
    console.log('✅ [Membership] Found', memberships.length, 'memberships');
    res.json(memberships);
  } catch (error) {
    console.error('❌ [Membership] Error fetching user memberships:', error);
    res.status(500).json({ error: 'Failed to fetch memberships' });
  }
});

// Get user's current active membership
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const membership = await Membership.findOne({
      user: req.user._id,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('tier');
    
    if (!membership) {
      return res.json({ membership: null, message: 'No active membership found' });
    }
    
    res.json({ membership });
  } catch (error) {
    console.error('❌ [Membership] Error fetching current membership:', error);
    res.status(500).json({ error: 'Failed to fetch current membership' });
  }
});

// Create new membership (admin only)
router.post('/', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Creating membership for user:', req.body.userId);
    
    const { userId, tierId, startDate, endDate, amount, paymentMethod, notes } = req.body;
    
    // Validate tier exists
    const tier = await MembershipTier.findById(tierId);
    if (!tier) {
      return res.status(404).json({ error: 'Membership tier not found' });
    }
    
    // Check for existing active membership
    const existingMembership = await Membership.findOne({
      user: userId,
      status: 'active',
      endDate: { $gt: new Date() }
    });
    
    if (existingMembership) {
      return res.status(400).json({ 
        error: 'User already has an active membership',
        existingMembership: existingMembership._id
      });
    }
    
    const membershipData = {
      user: userId,
      tier: tierId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      amount: amount || tier.price,
      totalAmount: amount || tier.price,
      paymentMethod,
      notes,
      createdBy: req.user._id
    };
    
    const membership = new Membership(membershipData);
    await membership.save();
    
    await membership.populate('user tier');
    
    console.log('✅ [Membership] Membership created:', membership._id);
    res.status(201).json({ message: 'Membership created successfully', membership });
  } catch (error) {
    console.error('❌ [Membership] Error creating membership:', error);
    res.status(400).json({ error: 'Failed to create membership' });
  }
});

// Update membership (admin only)
router.put('/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Updating membership:', req.params.id);
    
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('user tier');
    
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    
    console.log('✅ [Membership] Membership updated:', membership._id);
    res.json({ message: 'Membership updated successfully', membership });
  } catch (error) {
    console.error('❌ [Membership] Error updating membership:', error);
    res.status(400).json({ error: 'Failed to update membership' });
  }
});

// Suspend membership (admin only)
router.post('/:id/suspend', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Suspending membership:', req.params.id);
    
    const { reason, endDate } = req.body;
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    
    await membership.suspend(reason, new Date(endDate), req.user._id);
    await membership.populate('user tier');
    
    console.log('✅ [Membership] Membership suspended:', membership._id);
    res.json({ message: 'Membership suspended successfully', membership });
  } catch (error) {
    console.error('❌ [Membership] Error suspending membership:', error);
    res.status(400).json({ error: 'Failed to suspend membership' });
  }
});

// Unsuspend membership (admin only)
router.post('/:id/unsuspend', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Unsuspending membership:', req.params.id);
    
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    
    await membership.unsuspend(req.user._id);
    await membership.populate('user tier');
    
    console.log('✅ [Membership] Membership unsuspended:', membership._id);
    res.json({ message: 'Membership unsuspended successfully', membership });
  } catch (error) {
    console.error('❌ [Membership] Error unsuspending membership:', error);
    res.status(400).json({ error: 'Failed to unsuspend membership' });
  }
});

// Renew membership (admin only)
router.post('/:id/renew', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Renewing membership:', req.params.id);
    
    const { months } = req.body;
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    
    if (!membership.canRenew()) {
      return res.status(400).json({ error: 'Membership cannot be renewed' });
    }
    
    await membership.renew(months, req.user._id);
    await membership.populate('user tier');
    
    console.log('✅ [Membership] Membership renewed:', membership._id);
    res.json({ message: 'Membership renewed successfully', membership });
  } catch (error) {
    console.error('❌ [Membership] Error renewing membership:', error);
    res.status(400).json({ error: 'Failed to renew membership' });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all memberships (admin only)
router.get('/admin/all', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Fetching all memberships (admin)');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const tier = req.query.tier;
    
    const filter = {};
    if (status) filter.status = status;
    if (tier) filter.tier = tier;
    
    const memberships = await Membership.find(filter)
      .populate('user tier')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Membership.countDocuments(filter);
    
    console.log('✅ [Membership] Found', memberships.length, 'memberships');
    res.json({
      memberships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ [Membership] Error fetching all memberships:', error);
    res.status(500).json({ error: 'Failed to fetch memberships' });
  }
});

// Get expiring memberships (admin only)
router.get('/admin/expiring', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    console.log('🔧 [Membership] Fetching memberships expiring in', days, 'days');
    
    const expiringMemberships = await Membership.getExpiringMemberships(days);
    
    console.log('✅ [Membership] Found', expiringMemberships.length, 'expiring memberships');
    res.json(expiringMemberships);
  } catch (error) {
    console.error('❌ [Membership] Error fetching expiring memberships:', error);
    res.status(500).json({ error: 'Failed to fetch expiring memberships' });
  }
});

// Get membership statistics (admin only)
router.get('/admin/stats', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Fetching membership statistics');
    
    const stats = await Membership.getMembershipStats();
    const popularTiers = await MembershipTier.getPopularTiers(5);
    
    // Get monthly trends
    const monthlyTrends = await Membership.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);
    
    console.log('✅ [Membership] Statistics fetched');
    res.json({
      ...stats,
      popularTiers,
      monthlyTrends
    });
  } catch (error) {
    console.error('❌ [Membership] Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch membership statistics' });
  }
});

// Bulk operations (admin only)
router.post('/admin/bulk', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Performing bulk operation:', req.body.operation);
    
    const { operation, membershipIds, data } = req.body;
    
    let result;
    
    switch (operation) {
      case 'suspend':
        result = await Membership.updateMany(
          { _id: { $in: membershipIds } },
          { 
            status: 'suspended',
            suspensionReason: data.reason,
            suspensionDate: new Date(),
            lastModifiedBy: req.user._id
          }
        );
        break;
        
      case 'activate':
        result = await Membership.updateMany(
          { _id: { $in: membershipIds } },
          { 
            status: 'active',
            suspensionReason: undefined,
            suspensionDate: undefined,
            lastModifiedBy: req.user._id
          }
        );
        break;
        
      case 'cancel':
        result = await Membership.updateMany(
          { _id: { $in: membershipIds } },
          { 
            status: 'cancelled',
            lastModifiedBy: req.user._id
          }
        );
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid bulk operation' });
    }
    
    console.log('✅ [Membership] Bulk operation completed:', result.modifiedCount, 'memberships updated');
    res.json({ 
      message: `Bulk ${operation} completed successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ [Membership] Error in bulk operation:', error);
    res.status(500).json({ error: 'Failed to perform bulk operation' });
  }
});

// Export memberships (admin only)
router.get('/admin/export', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('🔧 [Membership] Exporting memberships');
    
    const memberships = await Membership.find()
      .populate('user tier')
      .sort({ createdAt: -1 });
    
    // Convert to CSV format
    const csvData = memberships.map(membership => ({
      'User': membership.user.username,
      'Email': membership.user.email,
      'Tier': membership.tier.name,
      'Status': membership.status,
      'Start Date': membership.startDate.toISOString().split('T')[0],
      'End Date': membership.endDate.toISOString().split('T')[0],
      'Amount': membership.totalAmount,
      'Payment Status': membership.paymentStatus,
      'Created': membership.createdAt.toISOString().split('T')[0]
    }));
    
    console.log('✅ [Membership] Export completed:', csvData.length, 'records');
    res.json({ data: csvData, count: csvData.length });
  } catch (error) {
    console.error('❌ [Membership] Error exporting memberships:', error);
    res.status(500).json({ error: 'Failed to export memberships' });
  }
});

module.exports = router;
