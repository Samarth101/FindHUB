const mongoose = require('mongoose');

const handoverSchema = new mongoose.Schema({
  claim:      { type: mongoose.Schema.Types.ObjectId, ref: 'Claim',      required: true },
  lostReport: { type: mongoose.Schema.Types.ObjectId, ref: 'LostReport', required: true },
  foundItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem',  required: true },
  owner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
  finder:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',       default: null },

  /** If finder is anonymous, admin coordinates */
  adminSupervised: { type: Boolean, default: false },
  coordinatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  location:    { type: String, default: 'Admin Office', maxlength: 200 },
  scheduledAt: { type: Date, default: null },

  status: {
    type: String,
    enum: ['pending_schedule', 'scheduled', 'completed', 'cancelled', 'disputed'],
    default: 'pending_schedule',
  },

  confirmedByOwner:  { type: Boolean, default: false },
  confirmedByFinder: { type: Boolean, default: false },

  notes:       { type: String, default: '', maxlength: 500 },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

handoverSchema.index({ owner: 1, status: 1 });
handoverSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('Handover', handoverSchema);
