const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Username and password required' });
    }

    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ ok: false, error: 'Invalid username or password.' });
    }

    res.json({
      ok: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name || !role) {
      return res.status(400).json({ ok: false, error: 'All fields required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ ok: false, error: 'Username already exists' });
    }

    const newUser = new User({ username, password, name, role });
    await newUser.save();

    res.status(201).json({
      ok: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
