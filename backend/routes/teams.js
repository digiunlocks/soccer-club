const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { superAdminAuth } = require('./auth');

// Get all teams (public - no auth required)
router.get('/public', async (req, res) => {
  try {
    const teams = await Team.find({ visible: true }).sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching public teams:', error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

// Get all teams (admin only)
router.get('/', superAdminAuth, async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

// Get single team by ID (admin only)
router.get('/:id', superAdminAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Error fetching team' });
  }
});

// Create new team (admin only)
router.post('/', superAdminAuth, async (req, res) => {
  try {
    const team = new Team(req.body);
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating team' });
  }
});

// Update team (admin only)
router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error updating team' });
  }
});

// Delete team (admin only)
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Error deleting team' });
  }
});

// Add player to team (admin only)
router.post('/:id/players', superAdminAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    team.players.push(req.body);
    team.currentPlayers = team.players.length;
    await team.save();
    
    res.json(team);
  } catch (error) {
    console.error('Error adding player to team:', error);
    res.status(500).json({ message: 'Error adding player to team' });
  }
});

// Remove player from team (admin only)
router.delete('/:id/players/:playerId', superAdminAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    team.players = team.players.filter(player => player._id.toString() !== req.params.playerId);
    team.currentPlayers = team.players.length;
    await team.save();
    
    res.json(team);
  } catch (error) {
    console.error('Error removing player from team:', error);
    res.status(500).json({ message: 'Error removing player from team' });
  }
});

module.exports = router; 