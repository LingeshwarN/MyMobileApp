const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    mobile: { type: String },
    gender: { type: String },
    dob: { type: String },
    city: { type: String },
    address: { type: String },
    avatar: { type: String, default: 'https://picsum.photos/seed/user/200/200' },
    preferredGenre: { type: String },
    preferredLanguage: { type: String },
    preferredCinema: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);