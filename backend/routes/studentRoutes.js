const express = require('express');
const router = express.Router();
const { getStudents, getStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { adminProtect } = require('../middleware/authMiddleware');

// All student management routes require admin access
router.use(adminProtect);

router.get('/',      getStudents);
router.get('/:id',   getStudent);
router.put('/:id',   updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
