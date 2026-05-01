require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function cleanup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all inactive users (isActive: false)
    const result = await User.deleteMany({ isActive: false });
    console.log(`Deleted ${result.deletedCount} inactive users`);

    // Or delete a specific email:
    // await User.deleteOne({ email: 'your-email@example.com' });
    // console.log('Deleted user with that email');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanup();
