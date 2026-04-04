const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:   { type: String, required: true, maxlength: 100 },
  target:   { type: String, default: '' },          // "User:abc123" or "Claim:xyz"
  details:  { type: String, default: '', maxlength: 1000 },
  ipAddress:{ type: String, default: '' },
  userAgent:{ type: String, default: '' },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
