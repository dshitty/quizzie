const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign a JWT token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// Helper to send token response
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:         user._id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
    },
  });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, } = req.body;
    const user = await User.create({ name, email, password, studentId, department, semester });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Provide email and password' });
    }

    // select('+password') because password has select:false in schema
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected)
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};