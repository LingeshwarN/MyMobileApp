const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

function toPublicUser(doc) {
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    phone: doc.mobile || '',
    address: doc.address || '',
    city: doc.city || '',
    gender: doc.gender || '',
    avatar: doc.avatar || '',
  };
}

// GET /api/users/:id - public profile lookup
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(toPublicUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id - update own profile (auth required)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const { name, phone, address, city, gender, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name ?? undefined,
        mobile: phone ?? undefined,
        address: address ?? undefined,
        city: city ?? undefined,
        gender: gender ?? undefined,
        avatar: avatar ?? undefined,
      },
      { new: true, runValidators: true },
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(toPublicUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;