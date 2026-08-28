const Student = require('../models/Student');
const QuizAttempt = require('../models/QuizAttempt');

// @desc    List all students — with search, grade filter, and pagination
// @route   GET /api/students?search=&grade=&page=&limit=
// @access  Admin
const getStudents = async (req, res, next) => {
  try {
    const { search, grade, page = 1, limit = 20 } = req.query;

    const filter = {};

    // Case-insensitive search on name OR email
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    if (grade === '12' || grade === '13') {
      filter.grade = grade;
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Student.countDocuments(filter);

    const students = await Student.find(filter)
      .select('name email grade active createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      count:   students.length,
      data:    students,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single student with enriched quiz attempts + enrolled courses
// @route   GET /api/students/:id
// @access  Admin
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .select('-password')
      .populate('enrolledCourses', 'title grade');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch attempts with nested lesson title for display
    const rawAttempts = await QuizAttempt.find({ studentId: student._id })
      .populate({
        path: 'quizId',
        select: 'lessonId questions',
        populate: { path: 'lessonId', select: 'title type' },
      })
      .sort({ attemptedAt: -1 });

    const quizAttempts = rawAttempts.map((a) => {
      const total      = a.quizId?.questions?.length ?? a.answers.length;
      const percentage = total > 0 ? Math.round((a.score / total) * 100) : 0;
      return {
        _id:         a._id,
        quizId:      a.quizId?._id,
        lessonTitle: a.quizId?.lessonId?.title ?? 'Unknown lesson',
        lessonType:  a.quizId?.lessonId?.type  ?? '',
        score:       a.score,
        total,
        percentage,
        attemptedAt: a.attemptedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: { ...student.toObject(), quizAttempts },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a student (name, grade, active)
// @route   PUT /api/students/:id
// @access  Admin
const updateStudent = async (req, res, next) => {
  try {
    // Only allow safe fields — never let admin overwrite password via this route
    const { name, grade, active } = req.body;
    const allowedUpdate = {};
    if (name   !== undefined) allowedUpdate.name   = name;
    if (grade  !== undefined) allowedUpdate.grade  = grade;
    if (active !== undefined) allowedUpdate.active = active;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      allowedUpdate,
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a student and their quiz attempts
// @route   DELETE /api/students/:id
// @access  Admin
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Clean up related quiz attempts
    await QuizAttempt.deleteMany({ studentId: req.params.id });

    res.status(200).json({ success: true, message: 'Student and their quiz attempts deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudents, getStudent, updateStudent, deleteStudent };
