const express = require('express');
const router = express.Router();
const { getSiteContent, updateSiteContent } = require('../controllers/siteContentController');
const { adminProtect } = require('../middleware/authMiddleware');

router.get('/',  getSiteContent);               // public
router.put('/',  adminProtect, updateSiteContent); // admin only

module.exports = router;
