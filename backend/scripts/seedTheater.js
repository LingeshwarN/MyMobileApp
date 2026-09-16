require('dotenv').config();
const mongoose = require('mongoose');
const Theater = require('../models/Theater');
const { generateSeatTags } = require('../utils/seatTagging');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const rows = 10;
  const cols = 12;
  const rowLetters = 'ABCDEFGHIJ';

  const rawSeats = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // leave a center aisle gap at column 5-6 boundary for realism
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

  const theater = await Theater.create({
    name: 'CineBooks Demo Theater',
    location: 'Madurai, TN',
    screens: [{ screenNumber: 1, rows, cols, seats: taggedSeats }],
  });

  console.log('Seeded theater:', theater._id.toString());
  const goldCount = taggedSeats.filter((s) => s.tags.includes('best-view')).length;
  const familyCount = taggedSeats.filter((s) => s.tags.includes('family')).length;
  console.log(`Best View seats: ${goldCount}, Family cluster seats: ${familyCount}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});