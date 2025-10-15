const express = require('express');
const router = express.Router();
const Program = require('../models/Program');

// Get all programs (optionally filter by zip)
router.get('/', async (req, res) => {
  const { zip } = req.query;
  let filter = {};
  if (zip) filter.zipCodes = zip;
  const programs = await Program.find(filter).sort({ name: 1 });
  res.json(programs);
});

// Create program
router.post('/', async (req, res) => {
  try {
    const program = new Program(req.body);
    await program.save();
    res.status(201).json(program);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update program
router.put('/:id', async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(program);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete program
router.delete('/:id', async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 