const express = require('express');
const router = express.Router();
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  getAllLessonsFlat,
} = require('../controllers/lessonController');
const { adminProtect } = require('../middleware/authMiddleware');

// Public reads
router.get('/', getLessons);
router.get('/all-flat', adminProtect, getAllLessonsFlat); // must come before /:id
router.get('/:id', getLesson);

// Admin-only writes
router.post('/', adminProtect, createLesson);
router.put('/:id', adminProtect, updateLesson);
router.delete('/:id', adminProtect, deleteLesson);

module.exports = router;
