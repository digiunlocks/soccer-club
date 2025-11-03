const express = require('express');
const router = express.Router();
const Sponsor = require('../models/Sponsor');
const { superAdminAuth } = require('./auth');
const FinanceIntegrationService = require('../services/financeIntegrationService');

// GET all sponsors (public - only visible ones)
router.get('/public', async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ 
      status: 'Active', 
      isVisible: true 
    }).sort({ tier: 1, companyName: 1 });
    
    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching public sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// GET all sponsors (admin)
router.get('/', superAdminAuth, async (req, res) => {
  try {
    const { status, tier } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (tier) query.tier = tier;
    
    const sponsors = await Sponsor.find(query).sort({ createdAt: -1 });
    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// GET single sponsor by ID
router.get('/:id', superAdminAuth, async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }
    res.json(sponsor);
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({ error: 'Failed to fetch sponsor' });
  }
});

// CREATE new sponsor
router.post('/', superAdminAuth, async (req, res) => {
  try {
    const sponsor = new Sponsor(req.body);
    await sponsor.save();
    
    // 💰 Automatically record sponsorship payment in finance system (if Active)
    if (sponsor.status === 'Active' && sponsor.amount > 0) {
      try {
        await FinanceIntegrationService.recordSponsorshipPayment(sponsor);
        console.log('💰 [Finance Integration] Sponsorship payment recorded in finance system');
      } catch (financeError) {
        console.error('⚠️  [Finance Integration] Failed to record sponsorship payment:', financeError.message);
      }
    }
    
    res.status(201).json(sponsor);
  } catch (error) {
    console.error('Error creating sponsor:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create sponsor' });
  }
});

// UPDATE sponsor
router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const sponsor = await Sponsor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }
    
    res.json(sponsor);
  } catch (error) {
    console.error('Error updating sponsor:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
});

// DELETE sponsor
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    const sponsor = await Sponsor.findByIdAndDelete(req.params.id);
    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }
    res.json({ message: 'Sponsor deleted successfully' });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({ error: 'Failed to delete sponsor' });
  }
});

// GET sponsor statistics
router.get('/stats/overview', superAdminAuth, async (req, res) => {
  try {
    const [total, active, expiring] = await Promise.all([
      Sponsor.countDocuments(),
      Sponsor.countDocuments({ status: 'Active' }),
      Sponsor.countDocuments({ 
        status: 'Active',
        contractEnd: { 
          $gte: new Date(),
          $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    const sponsors = await Sponsor.find({ status: 'Active' });
    const totalRevenue = sponsors.reduce((sum, s) => sum + (s.amount || 0), 0);

    res.json({
      total,
      active,
      expiring,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching sponsor stats:', error);
    res.status(500).json({ error: 'Failed to fetch sponsor statistics' });
  }
});

module.exports = router;

