const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {fullName, email, password, mobile, gender, dob, city, address} = req.body;
    
    // Check existing
    let user = await User.findOne({email});
    if (user) {
      return res.status(400).json({message: 'User already exists'});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      gender,
      dob,
      city,
      address,
    });

    await user.save();

    const token = jwt.sign(
      {userId: user._id, email: user.email},
      process.env.JWT_SECRET || 'cinebooks_secret',
      {expiresIn: '7d'},
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        phone: user.mobile,
        address: user.address,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({message: 'Invalid credentials'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({message: 'Invalid credentials'});
    }

    const token = jwt.sign(
      {userId: user._id, email: user.email},
      process.env.JWT_SECRET || 'cinebooks_secret',
      {expiresIn: '7d'},
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        phone: user.mobile,
        address: user.address,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;
