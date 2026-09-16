const mongoose = require('mongoose');

const ShowSeatSchema = new mongoose.Schema(
  {
    row: Number,
    col: Number,
    label: String,
    type: String,
    tags: [String],
    status: {
      type: String,
      enum: ['available', 'held', 'booked'],
      default: 'available',
    },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    swappable: { type: Boolean, default: false }, // set true by owner post-purchase
  },
  { _id: false }
);

const ShowtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    screenId: { type: mongoose.Schema.Types.ObjectId, required: true },
    startTime: { type: Date, required: true },
    price: {
      standard: { type: Number, required: true },
      premium: { type: Number, required: true },
    },
    seats: [ShowSeatSchema],
  },
  { timestamps: true }
);

ShowtimeSchema.index({ movie: 1, theater: 1, startTime: 1 });

module.exports = mongoose.model('Showtime', ShowtimeSchema);