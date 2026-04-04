const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true, maxlength: 2000 },
  upvotes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isFlagged: { type: Boolean, default: false },
  flagReason:{ type: String, default: '' },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const communityThreadSchema = new mongoose.Schema({
  lostReport: { type: mongoose.Schema.Types.ObjectId, ref: 'LostReport', required: true },
  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },

  /**
   * Only PRIVACY-SAFE fields are stored here.
   * No brand, model, serial numbers, or identifying images.
   */
  title:       { type: String, required: true, maxlength: 160, trim: true },
  description: { type: String, required: true, maxlength: 1000, trim: true },
  category:    { type: String, required: true },
  location:    { type: String, required: true, maxlength: 200, trim: true },

  replies:   [replySchema],
  viewCount: { type: Number, default: 0 },

  isClosed:  { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

communityThreadSchema.index({ author: 1, isDeleted: 1 });
communityThreadSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityThread', communityThreadSchema);
