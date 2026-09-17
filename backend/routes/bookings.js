const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

const CONVENIENCE_FEE = 30;

// GET /api/bookings - current user's bookings (auth required)
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie')
      .populate('showtime')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings - create booking, atomically reserving seats (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { showtimeId, seatLabels, paymentMode } = req.body;

    if (!showtimeId || !Array.isArray(seatLabels) || seatLabels.length === 0) {
      return res.status(400).json({ error: 'showtimeId and seatLabels are required' });
    }

    const showtime = await Showtime.findById(showtimeId).populate('movie');
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

    const requestedLabels = new Set(seatLabels);
    const unavailable = [];

    for (const seat of showtime.seats) {
      if (requestedLabels.has(seat.label) && seat.status !== 'available') {
        unavailable.push(seat.label);
      }
    }

    if (unavailable.length > 0) {
      return res.status(409).json({
        error: 'Some seats are no longer available',
        unavailable,
      });
    }

    // Reserve the requested seats on the showtime
    showtime.seats = showtime.seats.map(seat => {
      if (requestedLabels.has(seat.label)) {
        return {
          row: seat.row,
          col: seat.col,
          label: seat.label,
          type: seat.type,
          tags: seat.tags,
          status: 'booked',
          bookedBy: req.user.id,
          swappable: false,
        };
      }
      return seat;
    });
    await showtime.save();

    const bookedSeats = showtime.seats
      .filter(seat => requestedLabels.has(seat.label))
      .map(seat => ({ row: seat.row, col: seat.col, label: seat.label }));

    const subtotal = showtime.seats
      .filter(seat => requestedLabels.has(seat.label))
      .reduce(
        (sum, seat) =>
          sum + (seat.type === 'premium' ? showtime.price.premium : showtime.price.standard),
        0,
      );
    const totalPrice = subtotal + CONVENIENCE_FEE;

    const booking = await Booking.create({
      user: req.user.id,
      movie: showtime.movie._id,
      showtime: showtime._id,
      seats: bookedSeats,
      totalPrice,
      paymentMode: paymentMode || 'UPI',
      status: 'confirmed',
    });

    const populated = await Booking.findById(booking._id).populate('movie').populate('showtime');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:id/cancel - cancel booking and release seats (auth required)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: 'confirmed',
    });
    if (!booking) return res.status(404).json({ error: 'Confirmed booking not found' });

    booking.status = 'cancelled';
    await booking.save();

    // Release the seats on the showtime
    await Showtime.updateOne(
      { _id: booking.showtime, 'seats.label': { $in: booking.seats.map(s => s.label) } },
      {
        $set: {
          'seats.$[seat].status': 'available',
          'seats.$[seat].bookedBy': null,
          'seats.$[seat].swappable': false,
        },
      },
      { arrayFilters: [{ 'seat.label': { $in: booking.seats.map(s => s.label) } }] },
    );

    const populated = await Booking.findById(booking._id).populate('movie').populate('showtime');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.CONVENIENCE_FEE = CONVENIENCE_FEE;