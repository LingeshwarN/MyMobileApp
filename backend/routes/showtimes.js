const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const Theater = require('../models/Theater');
const { generateSeatTags } = require('../utils/seatTagging');

// GET /api/showtimes?movie=<id> - list showtimes (optionally for a movie)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.movie) filter.movie = req.query.movie;
    if (req.query.theater) filter.theater = req.query.theater;

    const showtimes = await Showtime.find(filter)
      .populate('movie', 'name poster rating genre availability language duration price')
      .sort({ startTime: 1 });
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/showtimes/:id
router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate(
      'movie',
      'name poster rating genre availability language duration price',
    );
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });
    res.json(showtime);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/showtimes - create a showtime by copying a screen layout into live seat state
router.post('/', async (req, res) => {
  try {
    const { movie, theater, screenNumber, startTime, price } = req.body;

    const theaterDoc = await Theater.findById(theater);
    if (!theaterDoc) return res.status(404).json({ error: 'Theater not found' });

    const screen = theaterDoc.screens.find(
      s => s.screenNumber === (screenNumber || 1),
    );
    if (!screen) return res.status(404).json({ error: 'Screen not found in theater' });

    const taggedSeats = generateSeatTags(screen.seats, screen.rows, screen.cols);

    const showtime = await Showtime.create({
      movie,
      theater,
      screenId: screen._id,
      startTime,
      price: {
        standard: price?.standard || 250,
        premium: price?.premium || 350,
      },
      seats: taggedSeats.map(s => ({
        row: s.row,
        col: s.col,
        label: s.label,
        type: s.type,
        tags: s.tags,
        status: 'available',
        bookedBy: null,
        swappable: false,
      })),
    });

    res.status(201).json(showtime);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;