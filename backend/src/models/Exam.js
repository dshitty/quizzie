const mongoose = require('mongoose');

// Each option in an MCQ question
const optionSchema = new mongoose.Schema({
  label: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  text:  { type: String, required: true, trim: true },
});

// A single MCQ question
const questionSchema = new mongoose.Schema({
  questionText:  { type: String, required: true, trim: true },
  options:       { type: [optionSchema], validate: v => v.length === 4 },
  correctOption: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  marks:         { type: Number, default: 1 },
});

// The full exam
const examSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },

    // Questions are embedded inside the exam document.

    questions: {
      type:     [questionSchema],
      validate: {
        validator: v => v.length >= 1,
        message:   'Exam must have at least 1 question',
      },
    },

    durationMinutes: { type: Number, required: true, min: 1 },
    totalMarks:      { type: Number }, 
    passingMarks:    { type: Number, required: true },

    scheduledAt: { type: Date, required: true }, // When exam becomes available
    expiresAt:   { type: Date, required: true }, // When exam closes

    status: {
      type:    String,
      enum:    ['draft', 'scheduled', 'active', 'closed'],
      default: 'draft',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Auto-calculate totalMarks from sum of all question marks
examSchema.pre('save', function (next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
  next();
});

// Virtual: is the exam currently open
examSchema.virtual('isOpen').get(function () {
  const now = new Date();
  return this.status === 'active' && now >= this.scheduledAt && now <= this.expiresAt;
});

module.exports = mongoose.model('Exam', examSchema);