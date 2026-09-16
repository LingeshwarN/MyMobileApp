const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema(
  {
    row: { type: Number, required: true },   // 0-indexed
    col: { type: Number, required: true },   // 0-indexed
    label: { type: String, required: true }, // e.g. "A1", "J12"
    type: {
      type: String,
      enum: ['standard', 'premium', 'aisle'],
      default: 'standard',
    },
    tags: [{ type: String, enum: ['best-view', 'family'] }],
  },
  { _id: false }
);

const ScreenSchema = new mongoose.Schema(
  {
    screenNumber: { type: Number, required: true },
    rows: { type: Number, required: true },
    cols: { type: Number, required: true },
    seats: [SeatSchema], // flat list; see utils/seatTagging.js for matrix logic
  },
  { _id: true }
);

const TheaterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    screens: [ScreenSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theater', TheaterSchema);