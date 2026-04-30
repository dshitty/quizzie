const mongoose = require('mongoose');

// Each answer a student gave
const answerSchema = new mongoose.Schema({
  questionId:     { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null }, // null = skipped
  isCorrect:      { type: Boolean },
  marksAwarded:   { type: Number, default: 0 },
});

const attemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    exam:    { type: mongoose.Schema.Types.ObjectId, ref: 'Exam',  required: true },

    answers: [answerSchema],

    // Scoring — filled on submission
    totalScore:    { type: Number, default: 0 },
    totalMarks:    { type: Number },
    percentage:    { type: Number },
    isPassed:      { type: Boolean },

    // Timing
    startedAt:   { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeTakenMinutes: { type: Number },

    // Result gate — admin must release before student can see result
    resultReleased: { type: Boolean, default: false },
    releasedAt:     { type: Date },
    releasedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Prevent duplicate attempts
    isSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One student can attempt one exam only once
attemptSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);