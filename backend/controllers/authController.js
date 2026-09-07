const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Helper to sanitize expiresIn with a safe fallback
const getExpiresIn = () => {
  const raw = process.env.JWT_EXPIRES_IN;
  if (raw && typeof raw === 'string') {
    const cleaned = raw.replace(/['"]/g, '').trim();
    if (cleaned && cleaned !== 'undefined' && cleaned !== 'null') {
      return cleaned;
    }
  }
  return '7d';
};

// Helper to sign JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: getExpiresIn(),
  });

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, grade } = req.body;

    // Check if student already exists
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const student = await Student.create({ name, email, password, grade });
    const token = signToken(student._id);

    res.status(201).json({
      success: true,
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        grade: student.grade,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login student
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Explicitly select password (it's hidden by default)
    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(student._id);

    res.status(200).json({
      success: true,
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        grade: student.grade,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged-in student
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({ success: true, student: req.student });
};

module.exports = { register, login, getMe };
