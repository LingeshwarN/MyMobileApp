const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');

const sampleGenres = [
  {id: '1', name: 'Action', icon: 'flame', color: '#FF5252'},
  {id: '2', name: 'Comedy', icon: 'happy', color: '#FFB300'},
  {id: '3', name: 'Drama', icon: 'heart', color: '#E040FB'},
  {id: '4', name: 'Sci-Fi', icon: 'planet', color: '#448AFF'},
];

router.get('/', async (req, res) => {
  try {
    const genres = await Genre.find();
    if (genres.length > 0) return res.json(genres);
    res.json(sampleGenres);
  } catch (err) {
    res.json(sampleGenres);
  }
});

router.post('/', async (req, res) => {
  try {
    const genre = new Genre(req.body);
    await genre.save();
    res.status(201).json(genre);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

module.exports = router;
