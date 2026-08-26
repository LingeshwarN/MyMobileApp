const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  icon: {type: String, default: 'film'},
  color: {type: String, default: '#6C3CE1'},
}, {timestamps: true});

module.exports = mongoose.model('Genre', GenreSchema);
