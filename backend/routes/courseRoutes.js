const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { adminProtect } = require('../middleware/authMiddleware');

// Public reads
router.get('/', getCourses);
router.get('/:id', getCourse);

// Admin-only writes
router.post('/', adminProtect, createCourse);
router.put('/:id', adminProtect, updateCourse);
router.delete('/:id', adminProtect, deleteCourse);

module.exports = router;
