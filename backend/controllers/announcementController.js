const Announcement = require('../models/Announcement');

// @desc    Get announcements (global + course specific if courseId given)
// @route   GET /api/announcements?courseId=xxx
// @access  Public / Student
const getAnnouncements = async (req, res, next) => {
  try {
    const courseId = req.query.courseId;
    let filter = {};
    if (courseId) {
      filter = {
        $or: [
          { courseId: null },
          { courseId: { $exists: false } },
          { courseId },
        ],
      };
    }

    const announcements = await Announcement.find(filter)
      .populate('courseId', 'title grade')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: announcements.length, data: announcements });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all announcements flat for admin list
// @route   GET /api/announcements/all-flat
// @access  Admin
const getAllAnnouncementsFlat = async (req, res, next) => {
  try {
    const rawItems = await Announcement.find()
      .populate('courseId', 'title grade')
      .sort({ createdAt: -1 });

    const data = rawItems.map((a) => {
      const crs = a.courseId;
      const courseLabel = crs ? `Grade ${crs.grade} › ${crs.title}` : 'General (All Students)';
      return {
        _id:         a._id,
        title:       a.title,
        message:     a.message,
        courseId:    crs?._id || a.courseId || null,
        courseLabel,
        createdAt:   a.createdAt,
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public / Student / Admin
const getAnnouncement = async (req, res, next) => {
  try {
    const item = await Announcement.findById(req.params.id).populate('courseId', 'title grade');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Admin
const createAnnouncement = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.courseId || payload.courseId === '') {
      payload.courseId = null;
    }
    const item = await Announcement.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Admin
const updateAnnouncement = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.courseId || payload.courseId === '') {
      payload.courseId = null;
    }
    const item = await Announcement.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Admin
const deleteAnnouncement = async (req, res, next) => {
  try {
    const item = await Announcement.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.status(200).json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnnouncements,
  getAllAnnouncementsFlat,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
