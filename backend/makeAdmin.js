require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Change the first user to admin (or change the email below)
    const result = await User.findOneAndUpdate(
      { email: 'dar@gmail.com' }, // Change this to your email
      { role: 'admin' },
      { new: true }
    );

    if (result) {
      console.log(`✅ User updated to admin:`);
      console.log(`Email: ${result.email}`);
      console.log(`Role: ${result.role}`);
    } else {
      console.log('❌ User not found. Change the email in the script!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

makeAdmin();
