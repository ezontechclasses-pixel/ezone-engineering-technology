const SiteContent = require('../models/SiteContent');

// Helper — fetch the single document, or create a blank one if it doesn't exist yet
const getOrCreate = () =>
  SiteContent.findOneAndUpdate(
    {},                         // match any document
    { $setOnInsert: {} },       // only write on insert, don't overwrite existing data
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

// @desc    Get site content
// @route   GET /api/site-content
// @access  Public
const getSiteContent = async (req, res, next) => {
  try {
    const content = await getOrCreate();
    res.status(200).json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
};

// @desc    Update site content
// @route   PUT /api/site-content
// @access  Admin
const updateSiteContent = async (req, res, next) => {
  try {
    // Find the one document and apply the update
    const content = await SiteContent.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, runValidators: true, upsert: true }
    );
    res.status(200).json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSiteContent, updateSiteContent };
