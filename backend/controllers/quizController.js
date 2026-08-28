const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// ─── Helper ───────────────────────────────────────────────────────────────────
// Strip sensitive fields before sending questions to the student
const sanitiseQuestions = (questions) =>
  questions.map((q) => ({
    _id:      q._id,
    question: q.question,
    options:  q.options,
    // correctAnswer and explanation are intentionally omitted
  }));

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get quiz for a lesson (no answers exposed)
// @route   GET /api/quizzes/lesson/:lessonId
// @access  Public / Student
// ─────────────────────────────────────────────────────────────────────────────
const getQuizByLesson = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ lessonId: req.params.lessonId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'No quiz found for this lesson' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id:       quiz._id,
        lessonId:  quiz.lessonId,
        questions: sanitiseQuestions(quiz.questions),
        total:     quiz.questions.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit a quiz attempt — server scores it, never trusts client score
// @route   POST /api/quizzes/:quizId/submit
// @access  Protected (student JWT)
// Body:    { answers: [{ questionId: string, selectedAnswer: string }] }
// ─────────────────────────────────────────────────────────────────────────────
const submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: '`answers` must be an array' });
    }

    // Build a lookup map: questionId (string) → selectedAnswer
    const answerMap = {};
    for (const a of answers) {
      if (a.questionId && a.selectedAnswer !== undefined) {
        answerMap[String(a.questionId)] = a.selectedAnswer;
      }
    }

    // Score server-side and build per-question result
    let score = 0;
    const results = quiz.questions.map((q) => {
      const selected = answerMap[String(q._id)] ?? null;
      const correct  = selected === q.correctAnswer;
      if (correct) score += 1;
      return {
        questionId:    q._id,
        question:      q.question,
        selectedAnswer: selected,
        correctAnswer:  q.correctAnswer,
        explanation:    q.explanation || '',
        correct,
      };
    });

    const total      = quiz.questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // Persist the attempt
    await QuizAttempt.create({
      studentId:   req.student._id,
      quizId:      quiz._id,
      score,
      answers:     answers.map((a) => ({ questionId: a.questionId, selectedAnswer: a.selectedAnswer })),
      attemptedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      data: { score, total, percentage, results },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get the current student's attempt history for a quiz
// @route   GET /api/quizzes/:quizId/attempts
// @access  Protected (student JWT)
// ─────────────────────────────────────────────────────────────────────────────
const getAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({
      studentId: req.student._id,
      quizId:    req.params.quizId,
    }).sort({ attemptedAt: -1 });

    if (attempts.length === 0) {
      return res.status(200).json({ success: true, count: 0, best: null, data: [] });
    }

    // Find the best attempt
    const best = attempts.reduce((top, a) => (a.score > top.score ? a : top), attempts[0]);

    const data = attempts.map((a) => ({
      _id:         a._id,
      score:       a.score,
      total:       a.answers.length,
      percentage:  a.answers.length > 0 ? Math.round((a.score / a.answers.length) * 100) : 0,
      attemptedAt: a.attemptedAt,
      isBest:      String(a._id) === String(best._id),
    }));

    res.status(200).json({ success: true, count: data.length, best: data[0].isBest ? data[0] : data.find(d => d.isBest), data });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin CRUD
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Create a quiz (admin)
// @route   POST /api/quizzes
const createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a quiz and its questions (admin)
// @route   PUT /api/quizzes/:quizId
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.quizId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.status(200).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a quiz and all its attempts (admin)
// @route   DELETE /api/quizzes/:quizId
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    await QuizAttempt.deleteMany({ quizId: req.params.quizId });
    res.status(200).json({ success: true, message: 'Quiz and all attempts deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get ALL quizzes (admin) — populated with lesson label
// @route   GET /api/quizzes
const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find()
      .populate({ path: 'lessonId', select: 'title type unitId', populate: { path: 'unitId', select: 'title courseId', populate: { path: 'courseId', select: 'title grade' } } })
      .sort({ createdAt: -1 });

    const data = quizzes.map((q) => ({
      _id:           q._id,
      lessonId:      q.lessonId?._id,
      lessonTitle:   q.lessonId?.title,
      lessonType:    q.lessonId?.type,
      lessonLabel:   q.lessonId
        ? `Grade ${q.lessonId?.unitId?.courseId?.grade ?? '?'} › ${q.lessonId?.unitId?.title ?? '?'} › ${q.lessonId?.title}`
        : '(lesson deleted)',
      questionCount: q.questions.length,
      createdAt:     q.createdAt,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single quiz WITH answers/explanations (admin only)
// @route   GET /api/quizzes/:quizId/full
const getQuizFull = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate({ path: 'lessonId', select: 'title type' });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.status(200).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getQuizByLesson,
  submitQuiz,
  getAttempts,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzes,
  getQuizFull,
};
