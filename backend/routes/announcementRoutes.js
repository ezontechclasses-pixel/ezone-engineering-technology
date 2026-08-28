const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getAllAnnouncementsFlat,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { adminProtect } = require('../middleware/authMiddleware');

// Admin flat listing — MUST come before /:id route
router.get('/all-flat', adminProtect, getAllAnnouncementsFlat);

// Public / Student routes
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncement);

// Admin write routes
router.post('/', adminProtect, createAnnouncement);
router.put('/:id', adminProtect, updateAnnouncement);
router.delete('/:id', adminProtect, deleteAnnouncement);

module.exports = router;
