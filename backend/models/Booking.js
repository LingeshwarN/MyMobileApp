const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: {type: String, required: true, unique: true},
  userId: {type: String},
  movieName: {type: String, required: true},
  showtime: {type: String, required: true},
  seats: [{type: String}],
  quantity: {type: Number, required: true},
  subtotal: {type: Number, required: true},
  total: {type: Number, required: true},
  paymentMode: {type: String, required: true},
  status: {type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed'},
}, {timestamps: true});

module.exports = mongoose.model('Booking', BookingSchema);
