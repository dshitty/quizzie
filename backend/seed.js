const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo users
    const demoUsers = [
      { username: 'riya', password: 'pass123', name: 'Riya Sharma', role: 'student' },
      { username: 'arjun', password: 'pass123', name: 'Arjun Mehta', role: 'student' },
      { username: 'admin', password: 'admin123', name: 'Dr. Priya Nair', role: 'teacher' },
    ];

    const createdUsers = await User.insertMany(demoUsers);
    console.log(`✅ Seeded ${createdUsers.length} users successfully!`);

    createdUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.role})`);
    });

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
