const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  name: {type: String, required: true},
  poster: {type: String, required: true},
  rating: {type: Number, default: 4.0},
  genre: [{type: String}],
  synopsis: {type: String},
  releaseDate: {type: String},
  language: {type: String, default: 'English'},
  duration: {type: String, default: '2h 00m'},
  director: {type: String},
  cast: [{type: String}],
  availability: {type: String, enum: ['Now Showing', 'Coming Soon', 'Advance Booking'], default: 'Now Showing'},
  showtimes: [{type: String}],
  price: {type: Number, default: 250},
}, {timestamps: true});

module.exports = mongoose.model('Movie', MovieSchema);
