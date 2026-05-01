require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Drop the username unique index
    await User.collection.dropIndex('username_1');
    console.log('✅ Dropped username unique index');

    // Or drop ALL indexes and recreate schema indexes
    // await User.collection.dropIndexes();
    // console.log('Dropped all indexes');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

dropIndex();
