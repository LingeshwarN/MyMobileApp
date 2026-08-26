const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// Sample movies JSON fallback for Experiment 9
const sampleMovies = [
  {
    id: '1',
    name: 'Galactic Odyssey',
    poster: 'https://picsum.photos/seed/movie1/300/450',
    rating: 4.5,
    genre: ['Sci-Fi', 'Action'],
    synopsis: 'In the year 2450, humanity embarks on its greatest journey beyond the Milky Way.',
    releaseDate: '2026-01-15',
    language: 'English',
    duration: '2h 28m',
    availability: 'Now Showing',
    showtimes: ['10:00 AM', '1:30 PM', '5:00 PM', '9:00 PM'],
    price: 250,
  },
  {
    id: '2',
    name: 'The Last Samurai Rising',
    poster: 'https://picsum.photos/seed/movie2/300/450',
    rating: 4.8,
    genre: ['Action', 'Drama'],
    synopsis: 'Set in feudal Japan, a dishonored ronin seeks redemption.',
    releaseDate: '2026-02-20',
    language: 'Japanese',
    duration: '2h 45m',
    availability: 'Now Showing',
    showtimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'],
    price: 300,
  },
];

// GET /api/movies - Read all movies (CRUD GET)
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    if (movies.length > 0) return res.json(movies);
    res.json(sampleMovies);
  } catch (err) {
    res.json(sampleMovies);
  }
});

// GET /api/movies/:id - Get single movie
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) return res.json(movie);
    res.status(404).json({message: 'Movie not found'});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// POST /api/movies - Admin Create movie (CRUD POST)
router.post('/', async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

// PUT /api/movies/:id - Admin Update movie (CRUD PUT)
router.put('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.json(movie);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

// DELETE /api/movies/:id - Admin Delete movie (CRUD DELETE)
router.delete('/:id', async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({message: 'Movie deleted successfully'});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;
