require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const connectDB    = require('../src/config/db');
const errorHandler = require('../src/middleware/errorHandler');

const app = express();

// ── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ── Global Middleware ───────────────────────────────────────
app.use(helmet());                     // Sets secure HTTP headers
app.use(cors());                       // Allow frontend to call this API
app.use(express.json());               // Parse JSON request bodies
app.use(morgan('dev'));                // Log every request in dev

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',     require('../src/routes/authRoutes'));
app.use('/api/exams',    require('../src/routes/examRoutes'));
app.use('/api/attempts', require('../src/routes/attemptRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));