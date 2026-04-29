const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// API Routes
router.use('/auth', require('./auth'));
router.use('/quizzes', require('./quizzes'));
router.use('/results', require('./results'));

module.exports = router;
