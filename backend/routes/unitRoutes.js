const express = require('express');
const router = express.Router();
const {
  getAllUnitsFlat,
  getUnits,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit,
} = require('../controllers/unitController');
const { adminProtect } = require('../middleware/authMiddleware');

// Admin flat listing — MUST come before /:id route
router.get('/all-flat', adminProtect, getAllUnitsFlat);

// Public reads
router.get('/', getUnits);
router.get('/:id', getUnit);

// Admin-only writes
router.post('/', adminProtect, createUnit);
router.put('/:id', adminProtect, updateUnit);
router.delete('/:id', adminProtect, deleteUnit);

module.exports = router;
