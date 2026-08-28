const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Unit title is required'],
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Unit', unitSchema);
