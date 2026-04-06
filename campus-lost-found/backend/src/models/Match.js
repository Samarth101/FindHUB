const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  lostReport: { type: mongoose.Schema.Types.ObjectId, ref: 'LostReport', required: true },
  foundItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem',  required: true },

  /** Cosine similarity score from ML service (0–1) */
  score: { type: Number, required: true, min: 0, max: 1 },

  /** Match lifecycle:
   *  pending -> approved | rejected | review | closed
   */
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'review', 'closed'],
    default: 'pending',
  },

  /** Admin who manually reviewed (if applicable) */
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewNote: { type: String, default: '' },

  /** When verification was attempted */
  verifiedAt: { type: Date, default: null },
}, { timestamps: true });

matchSchema.index({ lostReport: 1, score: -1 });
matchSchema.index({ foundItem: 1, status: 1 });
matchSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Match', matchSchema);
