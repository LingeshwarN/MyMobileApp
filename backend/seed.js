const mongoose = require('mongoose');
require('dotenv').config();
const Movie = require('./models/Movie');
const Genre = require('./models/Genre');

const moviesData = [
  {
    name: 'Galactic Odyssey',
    poster: 'https://picsum.photos/seed/movie1/300/450',
    rating: 4.5,
    genre: ['Sci-Fi', 'Action'],
    synopsis: 'In the year 2450, humanity embarks on its greatest journey beyond the Milky Way.',
    releaseDate: '2026-01-15',
    language: 'English',
    duration: '2h 28m',
    director: 'James Mitchell',
    cast: ['Sarah Connor', 'David Park', 'Mia Reynolds'],
    availability: 'Now Showing',
    showtimes: ['10:00 AM', '1:30 PM', '5:00 PM', '9:00 PM'],
    price: 250,
  },
  {
    name: 'The Last Samurai Rising',
    poster: 'https://picsum.photos/seed/movie2/300/450',
    rating: 4.8,
    genre: ['Action', 'Drama'],
    synopsis: 'Set in feudal Japan, a dishonored ronin seeks redemption.',
    releaseDate: '2026-02-20',
    language: 'Japanese',
    duration: '2h 45m',
    director: 'Takeshi Kurosawa',
    cast: ['Ken Watanabe', 'Rinko Kikuchi'],
    availability: 'Now Showing',
    showtimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'],
    price: 300,
  },
];

const genresData = [
  {name: 'Action', icon: 'flame', color: '#FF5252'},
  {name: 'Comedy', icon: 'happy', color: '#FFB300'},
  {name: 'Drama', icon: 'heart', color: '#E040FB'},
  {name: 'Horror', icon: 'skull', color: '#607D8B'},
  {name: 'Romance', icon: 'rose', color: '#FF4081'},
  {name: 'Sci-Fi', icon: 'planet', color: '#448AFF'},
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cinebooks');
    console.log('Connected to MongoDB...');

    await Movie.deleteMany({});
    await Genre.deleteMany({});

    await Movie.insertMany(moviesData);
    await Genre.insertMany(genresData);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDB();
