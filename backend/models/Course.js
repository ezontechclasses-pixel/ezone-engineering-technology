const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    grade: {
      type: String,
      enum: ['12', '13'],
      required: [true, 'Grade is required'],
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    units: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
