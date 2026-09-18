const mongoose = require('mongoose');

const SquadLobbySchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    lockedSeats: [
      {
        seatNumber: { type: String, required: true },
        claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
      },
    ],
    createdAt: { type: Date, default: Date.now, expires: 900 } // 15 minutes TTL index
  },
  { timestamps: true },
);

module.exports = mongoose.model('SquadLobby', SquadLobbySchema);
