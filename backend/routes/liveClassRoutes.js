const express = require('express');
const router = express.Router();
const {
  getLiveClasses,
  joinLiveClass,
  getAllLiveClassesFlat,
  getLiveClass,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
  getClassAttendance,
} = require('../controllers/liveClassController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// Admin flat listing & attendance — MUST come before /:id route
router.get('/all-flat', adminProtect, getAllLiveClassesFlat);
router.get('/:id/attendance', adminProtect, getClassAttendance);

// Public / Student routes
router.get('/', getLiveClasses);
router.get('/:id', getLiveClass);
router.post('/:id/join', protect, joinLiveClass);

// Admin write routes
router.post('/', adminProtect, createLiveClass);
router.put('/:id', adminProtect, updateLiveClass);
router.delete('/:id', adminProtect, deleteLiveClass);

module.exports = router;
