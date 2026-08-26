const express = require('express');
const router = express.Router();

const promotions = [
  {
    id: '1',
    title: '🎬 FLAT 50% OFF',
    subtitle: 'On your first booking! Use code: CINE50',
    color: '#FFFFFF',
    backgroundColor: '#6C3CE1',
  },
  {
    id: '2',
    title: '🍿 BUY 1 GET 1 FREE',
    subtitle: 'Every Wednesday on all movies',
    color: '#FFFFFF',
    backgroundColor: '#FF5252',
  },
  {
    id: '3',
    title: '⭐ PREMIUM EXPERIENCE',
    subtitle: 'Upgrade to IMAX at just ₹99 extra',
    color: '#1A1A2E',
    backgroundColor: '#FFB800',
  },
];

router.get('/', (req, res) => {
  res.json(promotions);
});

module.exports = router;
