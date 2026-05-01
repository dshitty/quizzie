require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Show all users
    const users = await User.find();
    console.log(`Total users in database: ${users.length}\n`);
    
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Active: ${user.isActive}`);
      console.log(`Created: ${user.createdAt}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
