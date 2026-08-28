const Homework = require('../models/Homework');
const HomeworkSubmission = require('../models/HomeworkSubmission');

// @desc    Get homework for a course
// @route   GET /api/homework?courseId=xxx
// @access  Public / Student
const getHomework = async (req, res, next) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const items = await Homework.find(filter).sort({ dueDate: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all homework for admin flat list with submission counts
// @route   GET /api/homework/all-flat
// @access  Admin
const getAllHomeworkFlat = async (req, res, next) => {
  try {
    const rawItems = await Homework.find()
      .populate('courseId', 'title grade')
      .sort({ dueDate: -1 });

    // Aggregate submission counts
    const counts = await HomeworkSubmission.aggregate([
      { $group: { _id: '$homeworkId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const data = rawItems.map((h) => {
      const crs = h.courseId;
      const courseLabel = crs ? `Grade ${crs.grade} › ${crs.title}` : 'Unassigned';
      return {
        _id:             h._id,
        title:           h.title,
        description:     h.description,
        resourceLink:    h.resourceLink,
        dueDate:         h.dueDate,
        courseId:        crs?._id || h.courseId,
        courseLabel,
        submissionCount: countMap[h._id.toString()] || 0,
        createdAt:       h.createdAt,
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single student's submission for a homework
// @route   GET /api/homework/:id/my-submission
// @access  Protected (Student)
const getStudentSubmission = async (req, res, next) => {
  try {
    const submission = await HomeworkSubmission.findOne({
      homeworkId: req.params.id,
      studentId:  req.student._id,
    });
    res.status(200).json({ success: true, data: submission || null });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit homework (upserts student submission)
// @route   POST /api/homework/:id/submit
// @access  Protected (Student)
const submitHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    const { submissionLink, note } = req.body;
    if (!submissionLink) {
      return res.status(400).json({ success: false, message: 'Submission link is required' });
    }

    const submission = await HomeworkSubmission.findOneAndUpdate(
      { homeworkId: homework._id, studentId: req.student._id },
      {
        submissionLink,
        note: note || '',
        submittedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single homework
// @route   GET /api/homework/:id
// @access  Public / Student / Admin
const getSingleHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findById(req.params.id).populate('courseId', 'title grade');
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }
    res.status(200).json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};

// @desc    Create homework
// @route   POST /api/homework
// @access  Admin
const createHomework = async (req, res, next) => {
  try {
    const homework = await Homework.create(req.body);
    res.status(201).json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};

// @desc    Update homework
// @route   PUT /api/homework/:id
// @access  Admin
const updateHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }
    res.status(200).json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete homework & associated submissions
// @route   DELETE /api/homework/:id
// @access  Admin
const deleteHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findByIdAndDelete(req.params.id);
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }
    await HomeworkSubmission.deleteMany({ homeworkId: req.params.id });
    res.status(200).json({ success: true, message: 'Homework deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all submissions for a homework item
// @route   GET /api/homework/:id/submissions
// @access  Admin
const getHomeworkSubmissions = async (req, res, next) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    const records = await HomeworkSubmission.find({ homeworkId: req.params.id })
      .populate('studentId', 'name email grade')
      .sort({ submittedAt: -1 });

    const data = records.map((s) => {
      const isLate = new Date(s.submittedAt) > new Date(homework.dueDate);
      return {
        _id:            s._id,
        studentName:    s.studentId?.name || 'Unknown Student',
        studentEmail:   s.studentId?.email || '',
        studentGrade:   s.studentId?.grade || '',
        submissionLink: s.submissionLink,
        note:           s.note,
        submittedAt:    s.submittedAt,
        isLate,
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHomework,
  getAllHomeworkFlat,
  getStudentSubmission,
  submitHomework,
  getSingleHomework,
  createHomework,
  updateHomework,
  deleteHomework,
  getHomeworkSubmissions,
};
