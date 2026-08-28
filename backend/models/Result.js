const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    examTitle: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
    grade: {
      type: String,
      default: '',
      trim: true,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
