const express = require('express');
const router = express.Router();
const Standing = require('../models/Standing');
const { superAdminAuth } = require('./auth');

// GET all standings
router.get('/', async (req, res) => {
  try {
    const { season, league, division } = req.query;
    const query = {};
    
    if (season) query.season = season;
    if (league) query.league = league;
    if (division) query.division = division;
    
    const standings = await Standing.find(query)
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 });
    
    res.json(standings);
  } catch (error) {
    console.error('Error fetching standings:', error);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

// GET public standings
router.get('/public', async (req, res) => {
  try {
    const { season, league } = req.query;
    const query = { isPublic: true };
    
    if (season) query.season = season;
    if (league) query.league = league;
    
    const standings = await Standing.find(query)
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 })
      .select('-notes -isPublic');
    
    res.json(standings);
  } catch (error) {
    console.error('Error fetching public standings:', error);
    res.status(500).json({ error: 'Failed to fetch public standings' });
  }
});

// GET single standing by ID
router.get('/:id', async (req, res) => {
  try {
    const standing = await Standing.findById(req.params.id);
    if (!standing) {
      return res.status(404).json({ error: 'Standing not found' });
    }
    res.json(standing);
  } catch (error) {
    console.error('Error fetching standing:', error);
    res.status(500).json({ error: 'Failed to fetch standing' });
  }
});

// CREATE new standing
router.post('/', superAdminAuth, async (req, res) => {
  try {
    const standing = new Standing(req.body);
    standing.calculatePoints();
    await standing.save();
    res.status(201).json(standing);
  } catch (error) {
    console.error('Error creating standing:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create standing' });
  }
});

// UPDATE standing
router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const standing = await Standing.findById(req.params.id);
    if (!standing) {
      return res.status(404).json({ error: 'Standing not found' });
    }
    
    Object.assign(standing, req.body);
    standing.calculatePoints();
    await standing.save();
    
    res.json(standing);
  } catch (error) {
    console.error('Error updating standing:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update standing' });
  }
});

// DELETE standing
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    const standing = await Standing.findByIdAndDelete(req.params.id);
    if (!standing) {
      return res.status(404).json({ error: 'Standing not found' });
    }
    res.json({ message: 'Standing deleted successfully' });
  } catch (error) {
    console.error('Error deleting standing:', error);
    res.status(500).json({ error: 'Failed to delete standing' });
  }
});

module.exports = router;

