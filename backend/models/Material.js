const mongoose = require('mongoose');

const MATERIAL_TYPES = [
  'notes',
  'short-notes',
  'diagram',
  'drawing',
  'past-paper',
  'model-paper',
  'marking-scheme',
  'revision-paper',
  'important-questions',
];

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Material type is required'],
      enum: {
        values: MATERIAL_TYPES,
        message: '{VALUE} is not a valid material type',
      },
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Unit ID is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL link is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
module.exports.MATERIAL_TYPES = MATERIAL_TYPES;
