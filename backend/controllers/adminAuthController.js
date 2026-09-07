const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

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

const generateAdminToken = (adminId) => {
  return jwt.sign(
    { id: adminId, role: 'admin' },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: getExpiresIn() }
  );
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateAdminToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { adminLogin };
