const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

// GET /api/quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json({ ok: true, quizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// GET /api/quizzes/:id
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ ok: false, error: 'Quiz not found' });
    }
    res.json({ ok: true, quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// POST /api/quizzes
router.post('/', async (req, res) => {
  try {
    const { title, subject, duration, totalMarks, questions, createdBy } = req.body;

    if (!title || !subject || !duration || !totalMarks || !createdBy) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const questionsWithIds = questions.map(q => ({
      ...q,
      _id: new mongoose.Types.ObjectId(),
    }));

    const newQuiz = new Quiz({
      title,
      subject,
      duration,
      totalMarks,
      questions: questionsWithIds,
      createdBy,
      active: false,
    });

    await newQuiz.save();
    res.status(201).json({ ok: true, quiz: newQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// PUT /api/quizzes/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, subject, duration, totalMarks, questions, active } = req.body;

    const questionsWithIds = questions?.map(q => ({
      ...q,
      _id: q._id || new mongoose.Types.ObjectId(),
    }));

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title,
        subject,
        duration,
        totalMarks,
        questions: questionsWithIds,
        active,
      },
      { new: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({ ok: false, error: 'Quiz not found' });
    }

    res.json({ ok: true, quiz: updatedQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// DELETE /api/quizzes/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!deletedQuiz) {
      return res.status(404).json({ ok: false, error: 'Quiz not found' });
    }

    res.json({ ok: true, message: 'Quiz deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
