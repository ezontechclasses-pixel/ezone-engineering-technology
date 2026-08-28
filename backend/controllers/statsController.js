const Student = require('../models/Student');
const Lesson = require('../models/Lesson');
const Result = require('../models/Result');

// @desc    Get public statistics (live count)
// @route   GET /api/stats/public
// @access  Public
const getPublicStats = async (req, res, next) => {
  try {
    const studentsEnrolled = await Student.countDocuments();
    const totalLessons = await Lesson.countDocuments();

    // Calculate passRate and A/B count from Result documents
    const totalResults = await Result.countDocuments();

    let passRate = 0;
    let abResults = 0;

    if (totalResults > 0) {
      // Pass rate: percentage of results with marks/maxMarks >= 0.40 (40%)
      const allResults = await Result.find().select('marks maxMarks grade');
      let passedCount = 0;

      allResults.forEach((r) => {
        const max = r.maxMarks || 100;
        const pct = (r.marks / max) * 100;
        if (pct >= 40) {
          passedCount++;
        }
        if (r.grade && ['A', 'B'].includes(r.grade.toUpperCase())) {
          abResults++;
        }
      });

      passRate = Math.round((passedCount / totalResults) * 100);
    }

    res.status(200).json({
      success: true,
      data: {
        studentsEnrolled,
        totalLessons,
        passRate,
        abResults,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicStats };
