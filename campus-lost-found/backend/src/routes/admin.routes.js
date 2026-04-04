const router = require('express').Router();
const User           = require('../models/User');
const LostReport     = require('../models/LostReport');
const FoundItem      = require('../models/FoundItem');
const Match          = require('../models/Match');
const Claim          = require('../models/Claim');
const Handover       = require('../models/Handover');
const AuditLog       = require('../models/AuditLog');
const CommunityThread = require('../models/CommunityThread');
const auditService   = require('../services/audit.service');
const { authenticate, authorize } = require('../middleware/auth');
const limits = require('../middleware/rateLimiter');

const adminOnly = [authenticate, authorize('admin'), limits.adminAction];

/* ─── Stats ─────────────────────────────────────────────────────────── */
router.get('/stats', ...adminOnly, async (req, res, next) => {
  try {
    const [lost, found, matches, claims, handovers, users] = await Promise.all([
      LostReport.countDocuments({ isDeleted: false }),
      FoundItem.countDocuments({ isDeleted: false }),
      Match.countDocuments(),
      Claim.countDocuments({ status: 'pending' }),
      Handover.countDocuments({ status: 'completed' }),
      User.countDocuments({ isDeleted: false }),
    ]);
    res.json({ lost, found, matches, pendingClaims: claims, completedHandovers: handovers, users });
  } catch (err) { next(err); }
});

/* ─── User management ────────────────────────────────────────────────── */
router.get('/users', ...adminOnly, async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { isDeleted: false };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ users, total });
  } catch (err) { next(err); }
});

router.patch('/users/:id/ban', ...adminOnly, async (req, res, next) => {
  try {
    const { reason = '' } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true, banReason: reason }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await auditService.log({ actor: req.user._id, action: 'Banned user', target: `User:${user._id}`, details: reason, req, severity: 'high' });
    res.json({ user });
  } catch (err) { next(err); }
});

router.patch('/users/:id/unban', ...adminOnly, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false, banReason: '' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await auditService.log({ actor: req.user._id, action: 'Unbanned user', target: `User:${user._id}`, req });
    res.json({ user });
  } catch (err) { next(err); }
});

/* ─── Moderation (flagged community content) ─────────────────────────── */
router.get('/flagged', ...adminOnly, async (req, res, next) => {
  try {
    const threads = await CommunityThread.find({
      $or: [{ isFlagged: true }, { 'replies.isFlagged': true }],
      isDeleted: false,
    }).populate('author', 'name');
    res.json({ threads });
  } catch (err) { next(err); }
});

router.delete('/threads/:id', ...adminOnly, async (req, res, next) => {
  try {
    await CommunityThread.findByIdAndUpdate(req.params.id, { isDeleted: true });
    await auditService.log({ actor: req.user._id, action: 'Deleted community thread', target: `Thread:${req.params.id}`, req });
    res.json({ message: 'Thread removed.' });
  } catch (err) { next(err); }
});

router.delete('/threads/:threadId/replies/:replyId', ...adminOnly, async (req, res, next) => {
  try {
    const thread = await CommunityThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ message: 'Thread not found.' });
    const reply = thread.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found.' });
    reply.isDeleted = true;
    await thread.save();
    await auditService.log({ actor: req.user._id, action: 'Deleted reply', target: `Reply:${req.params.replyId}`, req });
    res.json({ message: 'Reply removed.' });
  } catch (err) { next(err); }
});

/* ─── Audit logs ─────────────────────────────────────────────────────── */
router.get('/audit-logs', ...adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const total = await AuditLog.countDocuments();
    const logs  = await AuditLog.find()
      .populate('actor', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ logs, total });
  } catch (err) { next(err); }
});

module.exports = router;
