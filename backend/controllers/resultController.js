const Result = require('../models/Result');

// @desc    Get logged-in student's exam results
// @route   GET /api/results/my
// @access  Protected (Student)
const getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ studentId: req.student._id })
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    next(err);
  }
};

// @desc    Get exam results for a specific student (Admin)
// @route   GET /api/results/student/:studentId
// @access  Admin
const getStudentResults = async (req, res, next) => {
  try {
    const results = await Result.find({ studentId: req.params.studentId })
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    next(err);
  }
};

// @desc    Create exam result for a student (Admin)
// @route   POST /api/results
// @access  Admin
const createResult = async (req, res, next) => {
  try {
    const result = await Result.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc    Update exam result (Admin)
// @route   PUT /api/results/:id
// @access  Admin
const updateResult = async (req, res, next) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete exam result (Admin)
// @route   DELETE /api/results/:id
// @access  Admin
const deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    res.status(200).json({ success: true, message: 'Result deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyResults,
  getStudentResults,
  createResult,
  updateResult,
  deleteResult,
};
