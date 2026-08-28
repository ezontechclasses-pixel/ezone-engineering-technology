const Unit = require('../models/Unit');
const Course = require('../models/Course');

// @desc    Get all units flat with Course title/grade (admin dropdown picker)
// @route   GET /api/units/all-flat
// @access  Admin
const getAllUnitsFlat = async (req, res, next) => {
  try {
    const rawUnits = await Unit.find()
      .populate('courseId', 'title grade')
      .sort({ createdAt: -1 });

    const data = rawUnits.map((u) => {
      const c = u.courseId;
      const label = c ? `Grade ${c.grade} › ${u.title}` : u.title;
      return {
        _id:      u._id,
        title:    u.title,
        courseId: c?._id || u.courseId,
        label,
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all units for a course
// @route   GET /api/units?courseId=xxx
// @access  Public
const getUnits = async (req, res, next) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const units = await Unit.find(filter).populate('lessons');
    res.status(200).json({ success: true, count: units.length, data: units });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single unit
// @route   GET /api/units/:id
// @access  Public
const getUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id).populate('lessons');
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    res.status(200).json({ success: true, data: unit });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a unit (admin only)
// @route   POST /api/units
// @access  Admin
const createUnit = async (req, res, next) => {
  try {
    const unit = await Unit.create(req.body);

    // Push unit reference into its parent course
    await Course.findByIdAndUpdate(unit.courseId, { $push: { units: unit._id } });

    res.status(201).json({ success: true, data: unit });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a unit (admin only)
// @route   PUT /api/units/:id
// @access  Admin
const updateUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    res.status(200).json({ success: true, data: unit });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a unit (admin only)
// @route   DELETE /api/units/:id
// @access  Admin
const deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    // Remove reference from parent course
    await Course.findByIdAndUpdate(unit.courseId, { $pull: { units: unit._id } });
    res.status(200).json({ success: true, message: 'Unit deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUnitsFlat, getUnits, getUnit, createUnit, updateUnit, deleteUnit };
