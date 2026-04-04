const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics', 'Water Bottles', 'Keys', 'Bags & Backpacks',
  'ID / Documents', 'Books & Notes', 'Clothing', 'Jewellery',
  'Sports Equipment', 'Stationery', 'Other',
];

const lostReportSchema = new mongoose.Schema({
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:     { type: String, enum: CATEGORIES, required: true },
  itemName:     { type: String, required: true, trim: true, maxlength: 120 },
  brand:        { type: String, trim: true, default: '' },
  color:        { type: String, trim: true, default: '' },
  description:  { type: String, trim: true, maxlength: 1000, default: '' },

  /* Private — used for AI matching + verification questions */
  distinguishingFeatures: { type: String, trim: true, maxlength: 1000, default: '' },

  location:     { type: String, required: true, trim: true, maxlength: 200 },
  dateLost:     { type: Date, required: true },
  images:       [{ type: String }],   // URLs

  /* AI embedding (stored for fast re-matching) */
  embedding:    { type: [Number], default: [] },

  /* Status lifecycle */
  status: {
    type: String,
    enum: ['searching', 'matched', 'claimed', 'returned', 'closed'],
    default: 'searching',
  },

  /* Community thread link */
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityThread', default: null },

  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

lostReportSchema.index({ student: 1, status: 1 });
lostReportSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('LostReport', lostReportSchema);
module.exports.CATEGORIES = CATEGORIES;
