require('dotenv').config();
const mongoose = require('mongoose');
const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { generateSeatTags } = require('../utils/seatTagging');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // 1. Ensure a theater + tagged screen exists
  let theater = await Theater.findOne({ name: 'CineBooks Demo Theater' });
  if (!theater) {
    const rows = 10;
    const cols = 12;
    const rowLetters = 'ABCDEFGHIJ';

    const rawSeats = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isAisle = c === 5 || c === 6;
        rawSeats.push({
          row: r,
          col: c,
          label: `${rowLetters[r]}${c + 1}`,
          type: isAisle ? 'aisle' : 'standard',
          tags: [],
        });
      }
    }

    const taggedSeats = generateSeatTags(rawSeats, rows, cols);
    theater = await Theater.create({
      name: 'CineBooks Demo Theater',
      location: 'Madurai, TN',
      screens: [{ screenNumber: 1, rows, cols, seats: taggedSeats }],
    });
    console.log('Seeded theater:', theater._id.toString());
  }

  const screen = theater.screens.find(s => s.screenNumber === 1);
  if (!screen) {
    console.error('No screen found in theater');
    process.exit(1);
  }

  // 2. Demo user for "my booked" seats
  const demoUser = await User.findOne({ email: 'lingesh@cinebooks.com' });
  if (!demoUser) {
    console.error('Demo user not found. Run `npm run seed` first.');
    process.exit(1);
  }

  // 3. Movies that can be booked
  const movies = await Movie.find({
    availability: { $in: ['Now Showing', 'Advance Booking'] },
  });
  console.log(`Creating showtimes for ${movies.length} movies`);

  await Showtime.deleteMany({});

  const dayOffset = [0, 1, 2];
  const timeSlots = ['10:00', '13:30', '17:30', '20:30'];

  for (const movie of movies) {
    for (let i = 0; i < 3; i++) {
      const startTime = new Date();
      startTime.setHours(0, 0, 0, 0);
      startTime.setDate(startTime.getDate() + dayOffset[i % dayOffset.length]);
      const slot = timeSlots[(i * 2 + movie.genre.length) % timeSlots.length];
      const [h, m] = slot.split(':').map(Number);
      startTime.setHours(h, m, 0, 0);

      const price =
        movie.price > 300
          ? { standard: movie.price, premium: movie.price + 100 }
          : { standard: movie.price, premium: movie.price + 80 };

      const seats = generateSeatTags(
        screen.seats.map(s => ({
          row: s.row,
          col: s.col,
          label: s.label,
          type: s.type,
          tags: [...s.tags],
        })),
        screen.rows,
        screen.cols,
      ).map(s => ({
        row: s.row,
        col: s.col,
        label: s.label,
        type: s.type,
        tags: s.tags,
        status: 'available',
        bookedBy: null,
        swappable: false,
      }));

      // Mark a realistic handful of seats as booked
      const bookable = seats.filter(s => s.type !== 'aisle');
      const sample = bookable.sort(() => Math.random() - 0.5).slice(0, 8);

      const myLabels = sample.slice(0, 3); // demo user's seats (appears in Orders)
      const others = sample.slice(3);

      for (const seat of sample) {
        seat.status = 'booked';
        seat.bookedBy = myLabels.includes(seat) ? demoUser._id : new mongoose.Types.ObjectId();
      }
      others.slice(0, 1).forEach(seat => {
        seat.swappable = true; // an offer to trigger a seat swap
      });

      const showtime = await Showtime.create({
        movie: movie._id,
        theater: theater._id,
        screenId: screen._id,
        startTime,
        price,
        seats,
      });

      if (myLabels.length > 0) {
        await Booking.create({
          user: demoUser._id,
          movie: movie._id,
          showtime: showtime._id,
          seats: myLabels.map(s => ({ row: s.row, col: s.col, label: s.label })),
          totalPrice: myLabels.reduce(
            (sum, s) => sum + (s.type === 'premium' ? price.premium : price.standard),
            0,
          ) + 30,
          paymentMode: 'UPI',
          status: 'confirmed',
        });
      }
    }
  }

  const total = await Showtime.countDocuments();
  console.log(`Seeded ${total} showtimes across ${movies.length} movies`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});