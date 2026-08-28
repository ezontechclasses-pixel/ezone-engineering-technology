const express = require('express');
const router = express.Router();
const {
  getHomework,
  getAllHomeworkFlat,
  getStudentSubmission,
  submitHomework,
  getSingleHomework,
  createHomework,
  updateHomework,
  deleteHomework,
  getHomeworkSubmissions,
} = require('../controllers/homeworkController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// Admin flat listing & submissions — MUST come before /:id routes
router.get('/all-flat', adminProtect, getAllHomeworkFlat);
router.get('/:id/submissions', adminProtect, getHomeworkSubmissions);

// Student protected routes
router.get('/:id/my-submission', protect, getStudentSubmission);
router.post('/:id/submit', protect, submitHomework);

// Public / General routes
router.get('/', getHomework);
router.get('/:id', getSingleHomework);

// Admin write routes
router.post('/', adminProtect, createHomework);
router.put('/:id', adminProtect, updateHomework);
router.delete('/:id', adminProtect, deleteHomework);

module.exports = router;
