const express = require('express');
const router = express.Router();
const {
  getMyResults,
  getStudentResults,
  createResult,
  updateResult,
  deleteResult,
} = require('../controllers/resultController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// Student protected route
router.get('/my', protect, getMyResults);

// Admin routes
router.get('/student/:studentId', adminProtect, getStudentResults);
router.post('/', adminProtect, createResult);
router.put('/:id', adminProtect, updateResult);
router.delete('/:id', adminProtect, deleteResult);

module.exports = router;
