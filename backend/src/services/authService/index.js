const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { protect } = require('../../middleware/auth');
const { authorizeAdmin } = require('../../middleware/role');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretcarrentaljwttokenkey2026', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new customer account (Admin account creation restricted from public registration)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all required fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Strictly enforce 'Customer' role for public account registrations
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Customer'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('[Auth Service] Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error during user registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & issue JWT token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('[Auth Service] Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged-in user details
// @access  Private (Requires JWT)
router.get('/me', protect, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
});

// @route   GET /api/auth/users
// @desc    Get all registered users in the system (Admin Only - User Details feature)
// @access  Private / Admin
router.get('/users', protect, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('[Auth Service] Fetch Users Error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving system users.' });
  }
});

module.exports = router;
