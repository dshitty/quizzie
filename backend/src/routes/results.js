const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

// GET /api/results
router.get('/', async (req, res) => {
  try {
    const results = await Result.find()
      .populate('userId', 'username name')
      .populate('quizId', 'title');
    res.json({ ok: true, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// GET /api/results/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId })
      .populate('quizId', 'title subject');
    res.json({ ok: true, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// POST /api/results
router.post('/', async (req, res) => {
  try {
    const { userId, quizId, score, total, answers } = req.body;

    if (!userId || !quizId || score === undefined || !total || !answers) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const percent = Math.round((score / total) * 100);

    const newResult = new Result({
      userId,
      quizId,
      score,
      total,
      percent,
      answers,
    });

    await newResult.save();
    res.status(201).json({ ok: true, result: newResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// DELETE /api/results/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedResult = await Result.findByIdAndDelete(req.params.id);

    if (!deletedResult) {
      return res.status(404).json({ ok: false, error: 'Result not found' });
    }

    res.json({ ok: true, message: 'Result deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
