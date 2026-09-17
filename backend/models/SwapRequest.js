const mongoose = require('mongoose');

const SwapRequestSchema = new mongoose.Schema(
  {
    initiatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    initiatorBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    targetBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    initiatorSeat: { row: Number, col: Number, label: String },
    targetSeat: { row: Number, col: Number, label: String },
    showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);
