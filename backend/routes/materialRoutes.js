const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getAllMaterialsFlat,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/materialController');
const { adminProtect } = require('../middleware/authMiddleware');

// Admin flat listing — MUST come before /:id route
router.get('/all-flat', adminProtect, getAllMaterialsFlat);

// Public reads
router.get('/', getMaterials);
router.get('/:id', getMaterial);

// Admin-only writes
router.post('/', adminProtect, createMaterial);
router.put('/:id', adminProtect, updateMaterial);
router.delete('/:id', adminProtect, deleteMaterial);

module.exports = router;
