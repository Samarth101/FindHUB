const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: ['match', 'claim_approved', 'claim_rejected', 'claim_review',
           'chat_message', 'handover_scheduled', 'handover_complete',
           'community_reply', 'system'],
    required: true,
  },

  title:   { type: String, required: true, maxlength: 160 },
  body:    { type: String, required: true, maxlength: 500 },

  /** Deep-link payload */
  meta: {
    matchId:    { type: mongoose.Schema.Types.ObjectId, default: null },
    claimId:    { type: mongoose.Schema.Types.ObjectId, default: null },
    chatRoomId: { type: mongoose.Schema.Types.ObjectId, default: null },
    threadId:   { type: mongoose.Schema.Types.ObjectId, default: null },
    handoverId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },

  isRead:    { type: Boolean, default: false },
  readAt:    { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
