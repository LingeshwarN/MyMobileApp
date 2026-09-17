const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    seats: [{ row: Number, col: Number, label: String }],
    totalPrice: { type: Number, required: true },
    paymentMode: { type: String, enum: ['UPI', 'Card', 'Cash'], default: 'UPI' },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    swapStatus: { type: String, enum: ['none', 'open', 'pending'], default: 'none' },
    swapRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Booking', BookingSchema);
