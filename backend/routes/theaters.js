const express = require('express');
const router = express.Router();
const Theater = require('../models/Theater');

// GET /api/theaters - list all theaters
router.get('/', async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.json(theaters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/theaters/:id - full theater incl. screen seat layout
router.get('/:id', async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) return res.status(404).json({ error: 'Theater not found' });
    res.json(theater);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;