const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const SwapRequest = require('../models/SwapRequest');

function emitSwap(req, showtimeId, payload) {
  const io = req.app.get('io');
  if (io) {
    io.to(`showtime:${showtimeId}`).emit('seat-swapped', payload);
  }
}

function emitToUser(io, userId, payload) {
  if (io) {
    io.to(`user:${userId}`).emit('swap_received', payload);
  }
}

// ---- Standard swap lifecycle ----------------------------------------------

// POST /api/swaps/offer - mark one of my booked seats as available for swapping
router.post('/offer', auth, async (req, res) => {
  try {
    const { showtimeId, seatLabel } = req.body;

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

    const target = showtime.seats.find(s => s.label === seatLabel);
    if (!target) return res.status(404).json({ error: 'Seat not found' });
    if (target.status !== 'booked' || String(target.bookedBy) !== req.user.id) {
      return res.status(403).json({ error: 'You can only offer your own booked seats' });
    }

    await Showtime.updateOne(
      { _id: showtimeId, 'seats.label': seatLabel },
      { $set: { 'seats.$.swappable': true } },
    );
    await Booking.updateOne(
      { user: req.user.id, showtime: showtimeId, status: 'confirmed', seats: { $elemMatch: { label: seatLabel } } },
      { $set: { swapStatus: 'open', swapRequestedBy: null } },
    );

    res.json({ message: 'Seat offered for swap', seatLabel, swappable: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/swaps/unoffer - take a swap offer back
router.post('/unoffer', auth, async (req, res) => {
  try {
    const { showtimeId, seatLabel } = req.body;

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

    const target = showtime.seats.find(s => s.label === seatLabel);
    if (!target) return res.status(404).json({ error: 'Seat not found' });
    if (String(target.bookedBy) !== req.user.id) {
      return res.status(403).json({ error: 'You can only take back your own offers' });
    }

    await Showtime.updateOne(
      { _id: showtimeId, 'seats.label': seatLabel },
      { $set: { 'seats.$.swappable': false } },
    );
    await Booking.updateOne(
      { user: req.user.id, showtime: showtimeId, status: 'confirmed', seats: { $elemMatch: { label: seatLabel } } },
      { $set: { swapStatus: 'none', swapRequestedBy: null } },
    );

    res.json({ message: 'Swap offer removed', seatLabel, swappable: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/swaps/toggle - flip my own seat between swap-open / swap-closed
router.post('/toggle', auth, async (req, res) => {
  try {
    const { showtimeId, seatLabel } = req.body;

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

    const target = showtime.seats.find(s => s.label === seatLabel);
    if (!target) return res.status(404).json({ error: 'Seat not found' });
    if (target.status !== 'booked' || String(target.bookedBy) !== req.user.id) {
      return res.status(403).json({ error: 'You can only toggle your own booked seats' });
    }

    const newVal = !target.swappable;
    await Showtime.updateOne(
      { _id: showtimeId, 'seats.label': seatLabel },
      { $set: { 'seats.$.swappable': newVal } },
    );
    await Booking.updateOne(
      { user: req.user.id, showtime: showtimeId, status: 'confirmed', seats: { $elemMatch: { label: seatLabel } } },
      { $set: { swapStatus: newVal ? 'open' : 'none', swapRequestedBy: null } },
    );

    res.json({
      message: newVal ? 'Seat offered for swap' : 'Swap offer removed',
      seatLabel,
      swappable: newVal,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/swaps/initiate - create SwapRequest, mark both bookings pending,
// and relay an 'initiate_swap' -> 'swap_received' event to the target user.
router.post('/initiate', auth, async (req, res) => {
  try {
    const { showtimeId, mySeat, theirSeat } = req.body;

    if (!showtimeId || !mySeat || !theirSeat) {
      return res.status(400).json({ error: 'showtimeId, mySeat and theirSeat are required' });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

    const mine = showtime.seats.find(s => s.label === mySeat);
    const theirs = showtime.seats.find(s => s.label === theirSeat);
    if (!mine || !theirs) return res.status(404).json({ error: 'Seat not found' });
    if (mine.status !== 'booked' || String(mine.bookedBy) !== req.user.id) {
      return res.status(403).json({ error: 'You must own the seat you are offering' });
    }
    if (theirs.status !== 'booked' || !theirs.swappable) {
      return res.status(409).json({ error: 'The other seat is not currently swappable' });
    }
    if (theirs.swappable && String(theirs.bookedBy) === req.user.id) {
      return res.status(400).json({ error: 'The other seat already belongs to you' });
    }

    const myBooking = await Booking.findOne({
      user: req.user.id,
      showtime: showtimeId,
      status: 'confirmed',
      seats: { $elemMatch: { label: mySeat } },
    });
    const theirBooking = await Booking.findOne({
      user: theirs.bookedBy,
      showtime: showtimeId,
      status: 'confirmed',
      seats: { $elemMatch: { label: theirSeat } },
    });
    if (!myBooking || !theirBooking) {
      return res.status(409).json({ error: 'Could not resolve bookings for these seats' });
    }

    const existing = await SwapRequest.findOne({
      showtimeId,
      initiatorId: req.user.id,
      targetId: theirs.bookedBy,
      status: 'pending',
    });
    if (existing) {
      return res.status(409).json({ error: 'A swap request is already pending with this user' });
    }

    const swapRequest = await SwapRequest.create({
      initiatorId: req.user.id,
      targetId: theirs.bookedBy,
      initiatorBooking: myBooking._id,
      targetBooking: theirBooking._id,
      initiatorSeat: { row: mine.row, col: mine.col, label: mine.label },
      targetSeat: { row: theirs.row, col: theirs.col, label: theirs.label },
      showtimeId,
      status: 'pending',
    });

    myBooking.swapStatus = 'pending';
    myBooking.swapRequestedBy = String(theirs.bookedBy);
    await myBooking.save();
    theirBooking.swapStatus = 'pending';
    theirBooking.swapRequestedBy = req.user.id;
    await theirBooking.save();

    // Relays directly to the target user's device
    const io = req.app.get('io');
    emitToUser(io, theirBooking.user, {
      type: 'initiate_swap',
      showtimeId,
      requestId: swapRequest._id,
      initiatorId: req.user.id,
      theirSeat,
      yourSeat: mySeat,
      message: `User wants to swap their ${mySeat} with your ${theirSeat}`,
    });
    emitToUser(io, req.user.id, {
      type: 'initiate_swap_sent',
      showtimeId,
      requestId: swapRequest._id,
      message: `Swap request sent — you offered ${mySeat} for ${theirSeat}.`,
    });

    res.status(201).json(swapRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/swaps/accept - atomically swap seat ownership between both users'
// Booking documents using a MongoDB transaction (session.withTransaction).
router.post('/accept', auth, async (req, res) => {
  const { swapRequestId } = req.body;
  if (!swapRequestId) return res.status(400).json({ error: 'swapRequestId is required' });

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const swapRequest = await SwapRequest.findById(swapRequestId).session(session);
      if (!swapRequest) throw Object.assign(new Error('Swap request not found'), { status: 404 });
      if (String(swapRequest.targetId) !== req.user.id) {
        throw Object.assign(new Error('You are not the target of this swap request'), { status: 403 });
      }
      if (swapRequest.status !== 'pending') {
        throw Object.assign(new Error('Swap request is no longer pending'), { status: 409 });
      }

      const targetBooking = await Booking.findById(swapRequest.targetBooking).session(session);
      const initiatorBooking = await Booking.findById(swapRequest.initiatorBooking).session(session);
      if (!targetBooking || !initiatorBooking) {
        throw Object.assign(new Error('One of the bookings no longer exists'), { status: 409 });
      }

      // Swap the seat entries between the two Booking documents atomically.
      targetBooking.seats = targetBooking.seats.map(s =>
        s.label === swapRequest.targetSeat.label ? swapRequest.initiatorSeat : s,
      );
      initiatorBooking.seats = initiatorBooking.seats.map(s =>
        s.label === swapRequest.initiatorSeat.label ? swapRequest.targetSeat : s,
      );
      targetBooking.swapStatus = 'none';
      targetBooking.swapRequestedBy = null;
      initiatorBooking.swapStatus = 'none';
      initiatorBooking.swapRequestedBy = null;
      await targetBooking.save({ session });
      await initiatorBooking.save({ session });

      // Reflect ownership change on the showtime seat map within the same transaction
      const showtime = await Showtime.findById(swapRequest.showtimeId).session(session);
      if (showtime) {
        showtime.seats = showtime.seats.map(seat => {
          if (seat.label === swapRequest.targetSeat.label) {
            return {
              row: seat.row,
              col: seat.col,
              label: seat.label,
              type: seat.type,
              tags: seat.tags,
              status: 'booked',
              bookedBy: swapRequest.initiatorId,
              swappable: false,
            };
          }
          if (seat.label === swapRequest.initiatorSeat.label) {
            return {
              row: seat.row,
              col: seat.col,
              label: seat.label,
              type: seat.type,
              tags: seat.tags,
              status: 'booked',
              bookedBy: swapRequest.targetId,
              swappable: false,
            };
          }
          return seat;
        });
        await showtime.save({ session });
      }

      swapRequest.status = 'accepted';
      await swapRequest.save({ session });
      result = swapRequest;
    });

    await session.endSession();

    // Notify both users + refresh the seat map
    const io = req.app.get('io');
    emitToUser(io, result.targetId, {
      type: 'swap_result',
      action: 'accepted',
      showtimeId: result.showtimeId,
      requestId: result._id,
      message: `Swap accepted — you now hold ${result.initiatorSeat.label}.`,
    });
    emitToUser(io, result.initiatorId, {
      type: 'swap_result',
      action: 'accepted',
      showtimeId: result.showtimeId,
      requestId: result._id,
      message: `Swap accepted — you now hold ${result.targetSeat.label}.`,
    });
    emitSwap(req, result.showtimeId, {
      showtimeId: result.showtimeId,
      mySeat: result.targetSeat.label,
      theirSeat: result.initiatorSeat.label,
      message: `Seats ${result.initiatorSeat.label} ↔ ${result.targetSeat.label} swapped`,
    });

    res.json({
      message: 'Swap accepted',
      yourSeat: result.initiatorSeat.label,
      theirSeat: result.targetSeat.label,
    });
  } catch (err) {
    await session.endSession();
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/swaps/reject - decline a pending swap request
router.post('/reject', auth, async (req, res) => {
  try {
    const { swapRequestId } = req.body;

    const swapRequest = await SwapRequest.findOne({ _id: swapRequestId, targetId: req.user.id });
    if (!swapRequest) return res.status(404).json({ error: 'Swap request not found' });
    if (swapRequest.status === 'pending') {
      swapRequest.status = 'rejected';
      await swapRequest.save();
      await Booking.updateOne(
        { _id: swapRequest.targetBooking },
        { $set: { swapStatus: 'none', swapRequestedBy: null } },
      );
      await Booking.updateOne(
        { _id: swapRequest.initiatorBooking },
        { $set: { swapStatus: 'none', swapRequestedBy: null } },
      );

      const io = req.app.get('io');
      emitToUser(io, swapRequest.initiatorId, {
        type: 'swap_result',
        action: 'rejected',
        showtimeId: swapRequest.showtimeId,
        requestId: swapRequest._id,
        message: 'Your swap request was declined.',
      });
    }
    res.json({ message: 'Swap request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;