const LiveClass = require('../models/LiveClass');
const Attendance = require('../models/Attendance');

// @desc    Get live classes for a course (or all if no courseId specified)
// @route   GET /api/live-classes?courseId=xxx
// @access  Public / Student
const getLiveClasses = async (req, res, next) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const classes = await LiveClass.find(filter).sort({ scheduledAt: 1 });
    res.status(200).json({ success: true, count: classes.length, data: classes });
  } catch (err) {
    next(err);
  }
};

// @desc    Join live class (records attendance & returns meeting link)
// @route   POST /api/live-classes/:id/join
// @access  Protected (Student)
const joinLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    // Safely record attendance (ignore duplicate key errors via upsert logic or try/catch)
    try {
      await Attendance.findOneAndUpdate(
        { studentId: req.student._id, liveClassId: liveClass._id },
        { $setOnInsert: { joinedAt: new Date() } },
        { upsert: true, new: true }
      );
    } catch (attErr) {
      // Ignore unique index collision if already recorded
    }

    res.status(200).json({
      success: true,
      meetingLink: liveClass.meetingLink,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all live classes for admin flat table
// @route   GET /api/live-classes/all-flat
// @access  Admin
const getAllLiveClassesFlat = async (req, res, next) => {
  try {
    const rawClasses = await LiveClass.find()
      .populate('courseId', 'title grade')
      .sort({ scheduledAt: -1 });

    const data = rawClasses.map((c) => {
      const crs = c.courseId;
      const courseLabel = crs ? `Grade ${crs.grade} › ${crs.title}` : 'Unassigned';
      return {
        _id:             c._id,
        title:           c.title,
        description:     c.description,
        meetingLink:     c.meetingLink,
        scheduledAt:     c.scheduledAt,
        durationMinutes: c.durationMinutes,
        recordingUrl:    c.recordingUrl,
        courseId:        crs?._id || c.courseId,
        courseLabel,
        createdAt:       c.createdAt,
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single live class
// @route   GET /api/live-classes/:id
// @access  Public / Student / Admin
const getLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id).populate('courseId', 'title grade');
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }
    res.status(200).json({ success: true, data: liveClass });
  } catch (err) {
    next(err);
  }
};

// @desc    Create live class
// @route   POST /api/live-classes
// @access  Admin
const createLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.create(req.body);
    res.status(201).json({ success: true, data: liveClass });
  } catch (err) {
    next(err);
  }
};

// @desc    Update live class
// @route   PUT /api/live-classes/:id
// @access  Admin
const updateLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }
    res.status(200).json({ success: true, data: liveClass });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete live class & associated attendance records
// @route   DELETE /api/live-classes/:id
// @access  Admin
const deleteLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findByIdAndDelete(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }
    await Attendance.deleteMany({ liveClassId: req.params.id });
    res.status(200).json({ success: true, message: 'Live class deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance records for a live class
// @route   GET /api/live-classes/:id/attendance
// @access  Admin
const getClassAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ liveClassId: req.params.id })
      .populate('studentId', 'name email grade')
      .sort({ joinedAt: -1 });

    const data = records.map((r) => ({
      _id:          r._id,
      studentName:  r.studentId?.name || 'Unknown Student',
      studentEmail: r.studentId?.email || '',
      studentGrade: r.studentId?.grade || '',
      joinedAt:     r.joinedAt,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLiveClasses,
  joinLiveClass,
  getAllLiveClassesFlat,
  getLiveClass,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
  getClassAttendance,
};
