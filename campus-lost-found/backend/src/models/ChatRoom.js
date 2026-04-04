const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:    { type: String, required: true, maxlength: 2000 },
  readBy:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted:{ type: Boolean, default: false },
}, { timestamps: true });

const chatRoomSchema = new mongoose.Schema({
  /** Human-readable label for admin display */
  name:       { type: String, default: 'Chat Room' },

  /** Participants: [lostOwner, finder] or [lostOwner, admin] */
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  /** Link to the claim that opened this room */
  claim:      { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
  match:      { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  lostReport: { type: mongoose.Schema.Types.ObjectId, ref: 'LostReport' },
  foundItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem' },

  messages:   [messageSchema],

  lastMessage:{ type: String, default: '' },
  lastActivity:{ type: Date, default: Date.now },

  isClosed:  { type: Boolean, default: false },
  isArchived:{ type: Boolean, default: false },
}, { timestamps: true });

chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
