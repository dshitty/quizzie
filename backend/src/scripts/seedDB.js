const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/database');

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});

    // Create demo users
    const users = [
      {
        username: 'riya',
        password: 'pass123',
        name: 'Riya Sharma',
        role: 'student',
      },
      {
        username: 'arjun',
        password: 'pass123',
        name: 'Arjun Mehta',
        role: 'student',
      },
      {
        username: 'admin',
        password: 'admin123',
        name: 'Dr. Priya Nair',
        role: 'teacher',
      },
    ];

    await User.insertMany(users);
    console.log('✅ Demo users created successfully!');
    console.log('Demo Accounts:');
    console.log('  Student: riya / pass123');
    console.log('  Student: arjun / pass123');
    console.log('  Teacher: admin / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedUsers();
