const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  percent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  answers: [Number],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Result', resultSchema);
