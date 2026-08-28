const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');
const { adminProtect } = require('../middleware/authMiddleware');

// Public
router.get('/', getTestimonials);

// Admin routes
router.post('/', adminProtect, createTestimonial);
router.put('/:id', adminProtect, updateTestimonial);
router.delete('/:id', adminProtect, deleteTestimonial);

module.exports = router;
