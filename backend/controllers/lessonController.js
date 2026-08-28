const Lesson = require('../models/Lesson');
const Unit = require('../models/Unit');

// @desc    Get all lessons (optionally filter by unitId)
// @route   GET /api/lessons?unitId=xxx
// @access  Public
const getLessons = async (req, res, next) => {
  try {
    const filter = req.query.unitId ? { unitId: req.query.unitId } : {};
    const lessons = await Lesson.find(filter);
    res.status(200).json({ success: true, count: lessons.length, data: lessons });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single lesson
// @route   GET /api/lessons/:id
// @access  Public
const getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, data: lesson });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a lesson (admin only)
// @route   POST /api/lessons
// @access  Admin
const createLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.create(req.body);

    // Push lesson reference into its parent unit
    await Unit.findByIdAndUpdate(lesson.unitId, { $push: { lessons: lesson._id } });

    res.status(201).json({ success: true, data: lesson });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a lesson (admin only)
// @route   PUT /api/lessons/:id
// @access  Admin
const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, data: lesson });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a lesson (admin only)
// @route   DELETE /api/lessons/:id
// @access  Admin
const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    // Remove reference from parent unit
    await Unit.findByIdAndUpdate(lesson.unitId, { $pull: { lessons: lesson._id } });
    res.status(200).json({ success: true, message: 'Lesson deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    All lessons with course/unit context — for admin dropdowns
// @route   GET /api/lessons/all-flat
// @access  Admin
const getAllLessonsFlat = async (req, res, next) => {
  try {
    const lessons = await Lesson.find().populate({
      path: 'unitId',
      select: 'title courseId',
      populate: { path: 'courseId', select: 'title grade' },
    });

    const data = lessons.map((l) => ({
      _id:      l._id,
      title:    l.title,
      type:     l.type,
      unitId:   l.unitId?._id,
      courseId: l.unitId?.courseId?._id,
      grade:    l.unitId?.courseId?.grade,
      // Human-readable label for dropdown
      label: `Grade ${l.unitId?.courseId?.grade ?? '?'} › ${l.unitId?.title ?? '?'} › ${l.title}`,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLessons, getLesson, createLesson, updateLesson, deleteLesson, getAllLessonsFlat };
