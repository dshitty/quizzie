require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('./src/models/Exam');

async function checkExams() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const now = new Date();
    console.log(`Current time: ${now.toLocaleString()}\n`);

    // Get all exams
    const exams = await Exam.find({}, 'title status scheduledAt expiresAt');
    
    console.log('All Exams:');
    console.log('═'.repeat(80));
    
    exams.forEach((exam, idx) => {
      const scheduled = new Date(exam.scheduledAt);
      const expires = new Date(exam.expiresAt);
      
      const isScheduledPassed = scheduled <= now;
      const isNotExpired = expires >= now;
      const isActive = exam.status === 'active';
      const isVisible = isActive && isScheduledPassed && isNotExpired;
      
      console.log(`\n${idx + 1}. ${exam.title}`);
      console.log(`   Status: ${exam.status} ${isActive ? '✓' : '✗'}`);
      console.log(`   Scheduled: ${scheduled.toLocaleString()} ${isScheduledPassed ? '✓ (started)' : '✗ (future)'}`);
      console.log(`   Expires: ${expires.toLocaleString()} ${isNotExpired ? '✓ (active)' : '✗ (expired)'}`);
      console.log(`   Visible to students: ${isVisible ? '✅ YES' : '❌ NO'}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\nTo make an exam visible to students:');
    console.log('1. Publish it (status = active)');
    console.log('2. Set scheduledAt to NOW or PAST');
    console.log('3. Set expiresAt to FUTURE\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkExams();
