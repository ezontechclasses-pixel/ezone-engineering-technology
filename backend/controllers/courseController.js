const Course = require('../models/Course');
const Unit = require('../models/Unit');
const Lesson = require('../models/Lesson');

// @desc    Get all courses (optionally filter by grade)
// @route   GET /api/courses?grade=12
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    const filter = req.query.grade ? { grade: req.query.grade } : {};
    const courses = await Course.find(filter).populate('units').sort({ grade: 1, title: 1 });
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'units',
      populate: { path: 'lessons' },
    });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a course (admin only)
// @route   POST /api/courses
// @access  Admin
const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a course (admin only)
// @route   PUT /api/courses/:id
// @access  Admin
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a course (admin only)
// @route   DELETE /api/courses/:id
// @access  Admin
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    // Delete all child units and their child lessons
    const units = await Unit.find({ courseId: course._id });
    const unitIds = units.map((u) => u._id);
    await Lesson.deleteMany({ unitId: { $in: unitIds } });
    await Unit.deleteMany({ courseId: course._id });

    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse };
