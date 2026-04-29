require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Serve static frontend files
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Routes
app.use('/api', require('./routes/index'));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ message: 'Not found' });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
