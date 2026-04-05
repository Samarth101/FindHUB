const mongoose = require('mongoose');
const { CATEGORIES } = require('./LostReport');

const foundItemSchema = new mongoose.Schema({
  /* Submitted by admin (intake form) or student (self-report) */
  submittedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submitterAnonymous: { type: Boolean, default: false },
  intakeAdmin:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  category:    { type: String, enum: CATEGORIES, required: true },
  itemName:    { type: String, required: true, trim: true, maxlength: 120 },
  brand:       { type: String, trim: true, default: '' },
  color:       { type: String, trim: true, default: '' },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  location:    { type: String, required: true, trim: true, maxlength: 200 },
  dateFound:   { type: Date, required: true },
  images:      [{ type: String }],

  /**
   * Secret clues provided by the finder.
   * Used to generate verification questions via AI.
   * NEVER exposed to non-admin users.
   */
  secretClues: [{
    text:      { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  }],

  /* AI embedding */
  embedding: { type: [Number], default: [] },

  /* Status lifecycle */
  status: {
    type: String,
    enum: ['unmatched', 'matched', 'claimed', 'returned', 'archived'],
    default: 'unmatched',
  },

  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

foundItemSchema.index({ category: 1, status: 1 });
foundItemSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('FoundItem', foundItemSchema);
