const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// GET /api/bookings - Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({createdAt: -1});
    res.json(bookings);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// POST /api/bookings - Create new booking
router.post('/', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

// PUT /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      {bookingId: req.params.id},
      {status: 'cancelled'},
      {new: true},
    );
    res.json(booking);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

module.exports = router;
