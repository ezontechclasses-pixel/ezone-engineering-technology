const express = require('express');
const router = express.Router();
const {
  getQuizByLesson,
  submitQuiz,
  getAttempts,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzes,
  getQuizFull,
} = require('../controllers/quizController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// ── Student / public ───────────────────────────────────────────────────────
// GET quiz for a lesson (no answers exposed) — kept public so guests can preview
router.get('/lesson/:lessonId', getQuizByLesson);

// Submit a quiz attempt (JWT required — we need req.student._id)
router.post('/:quizId/submit', protect, submitQuiz);

// Student's own attempt history for a quiz
router.get('/:quizId/attempts', protect, getAttempts);

// ── Admin ──────────────────────────────────────────────────────────────────
router.get('/',                adminProtect, getAllQuizzes);  // list all
router.get('/:quizId/full',   adminProtect, getQuizFull);    // with answers
router.post('/',               adminProtect, createQuiz);
router.put('/:quizId',        adminProtect, updateQuiz);
router.delete('/:quizId',     adminProtect, deleteQuiz);

module.exports = router;
