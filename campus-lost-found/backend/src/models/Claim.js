const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  question:   { type: String, required: true },
  answer:     { type: String, required: true, maxlength: 1000 },
  score:      { type: Number, default: 0 },   // AI-graded 0-1
}, { _id: false });

const claimSchema = new mongoose.Schema({
  match:     { type: mongoose.Schema.Types.ObjectId, ref: 'Match',     required: true },
  claimant:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  lostReport:{ type: mongoose.Schema.Types.ObjectId, ref: 'LostReport',required: true },
  foundItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },

  /** Blind verification Q&A */
  questions:  [{ id: String, text: String }],
  answers:    [answerSchema],

  /** Aggregate verification score (0–1) */
  verifyScore: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'review'],
    default: 'pending',
  },

  /** Admin review */
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewNote:  { type: String, default: '' },
  resolvedAt:  { type: Date, default: null },
}, { timestamps: true });

claimSchema.index({ claimant: 1, status: 1 });
claimSchema.index({ match: 1, claimant: 1 }, { unique: true }); // one claim per user per match
claimSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Claim', claimSchema);
