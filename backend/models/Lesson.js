const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Unit reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['theory', 'practical', 'drawing', 'pastpaper', 'modelpaper', 'revision'],
      required: [true, 'Lesson type is required'],
    },
    videoUrl: {
      type: String,
      default: null,
    },
    notesUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
