require('dotenv').config();

console.log('Testing MongoDB Atlas connection...');
console.log('URI:', process.env.MONGODB_URI);

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
