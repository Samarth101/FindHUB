const router = require('express').Router();
const { body } = require('express-validator');
const CommunityThread = require('../models/CommunityThread');
const LostReport = require('../models/LostReport');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const limits = require('../middleware/rateLimiter');

// GET all threads (paginated)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const filter = { isDeleted: false };
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await CommunityThread.countDocuments(filter);
    const threads = await CommunityThread.find(filter)
      .populate('author', 'name')
      .select('-replies')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ threads, total });
  } catch (err) { next(err); }
});

// GET single thread
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const thread = await CommunityThread.findById(req.params.id)
      .populate('author', 'name')
      .populate('replies.author', 'name');
    if (!thread || thread.isDeleted) return res.status(404).json({ message: 'Not found.' });
    thread.viewCount += 1;
    await thread.save();
    res.json({ thread });
  } catch (err) { next(err); }
});

// CREATE thread (linked to a lost report)
router.post('/', authenticate, limits.report, [
  body('lostReportId').notEmpty(),
  body('title').trim().notEmpty().isLength({ max: 160 }),
  body('description').trim().notEmpty().isLength({ max: 1000 }),
], validate, async (req, res, next) => {
  try {
    const { lostReportId, title, description } = req.body;
    const report = await LostReport.findOne({ _id: lostReportId, student: req.user._id });
    if (!report) return res.status(404).json({ message: 'Lost report not found or not yours.' });

    const thread = await CommunityThread.create({
      lostReport: report._id,
      author: req.user._id,
      title,
      description,
      category: report.category,
      location: report.location,
    });

    report.threadId = thread._id;
    await report.save();

    res.status(201).json({ thread });
  } catch (err) { next(err); }
});

// POST reply
router.post('/:id/replies', authenticate, limits.communityReply, [
  body('text').trim().notEmpty().isLength({ max: 2000 }),
], validate, async (req, res, next) => {
  try {
    const thread = await CommunityThread.findById(req.params.id);
    if (!thread || thread.isDeleted || thread.isClosed) {
      return res.status(404).json({ message: 'Thread not available.' });
    }
    thread.replies.push({ author: req.user._id, text: req.body.text });
    await thread.save();
    res.status(201).json({ reply: thread.replies[thread.replies.length - 1] });
  } catch (err) { next(err); }
});

// POST vote on reply
router.post('/:threadId/replies/:replyId/vote', authenticate, async (req, res, next) => {
  try {
    const { vote } = req.body; // 'up' | 'down'
    const thread = await CommunityThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ message: 'Not found.' });

    const reply = thread.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found.' });

    const uid = req.user._id;
    if (vote === 'up') {
      reply.downvotes.pull(uid);
      if (!reply.upvotes.includes(uid)) reply.upvotes.push(uid);
    } else {
      reply.upvotes.pull(uid);
      if (!reply.downvotes.includes(uid)) reply.downvotes.push(uid);
    }
    await thread.save();
    res.json({ upvotes: reply.upvotes.length, downvotes: reply.downvotes.length });
  } catch (err) { next(err); }
});

module.exports = router;
