require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('./src/models/Exam');

async function activateExams() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Update all draft exams to active
    const result = await Exam.updateMany(
      { status: 'draft' },
      { status: 'active' },
      { new: true }
    );

    console.log(`✅ Activated ${result.modifiedCount} exams`);

    // Show all exams
    const exams = await Exam.find({}, 'title status scheduledAt expiresAt');
    console.log('\nAll exams:');
    exams.forEach(exam => {
      const now = new Date();
      const isAvailable = exam.status === 'active' && 
                         new Date(exam.scheduledAt) <= now && 
                         new Date(exam.expiresAt) >= now;
      console.log(`- ${exam.title}: ${exam.status} ${isAvailable ? '✓ (visible to students)' : '✗ (hidden)'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

activateExams();
