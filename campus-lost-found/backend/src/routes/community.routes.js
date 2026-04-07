const router = require('express').Router();
const { body } = require('express-validator');
const CommunityThread = require('../models/CommunityThread');
const LostReport = require('../models/LostReport');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const limits = require('../middleware/rateLimiter');
const axios = require('axios');
const { mlServiceUrl } = require('../config/env');

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

// CREATE thread — either linked to a lost report or standalone
router.post('/', authenticate, limits.report, [
  body('title').trim().notEmpty().isLength({ max: 160 }),
  body('description').trim().notEmpty().isLength({ max: 1000 }),
], validate, async (req, res, next) => {
  try {
    const { lostReportId, title, description, category, location } = req.body;

    const threadData = {
      author: req.user._id,
      title,
      description,
      category: category || '',
      location: location || '',
    };

    // If linked to a lost report, attach it
    if (lostReportId) {
      const report = await LostReport.findOne({ _id: lostReportId, student: req.user._id });
      if (report) {
        threadData.lostReport = report._id;
        threadData.category = threadData.category || report.category;
        threadData.location = threadData.location || report.location;
        // Link thread back to report
        report.threadId = null; // will be set below
      }
    }

    const thread = await CommunityThread.create(threadData);

    // Link back to lost report if applicable
    if (lostReportId) {
      await LostReport.findByIdAndUpdate(lostReportId, { threadId: thread._id });
    }

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

// POST analyze thread (Calls Python AI)
router.post('/:id/analyze', authenticate, async (req, res, next) => {
  try {
    const thread = await CommunityThread.findById(req.params.id)
      .populate('author', 'name')
      .populate('replies.author', 'name');
    
    if (!thread || thread.isDeleted) return res.status(404).json({ message: 'Thread not found.' });

    const commentsParam = thread.replies.map(r => ({
      user_id: (r.author && r.author.name) ? r.author.name : 'Anonymous',
      timestamp: new Date(r.createdAt || Date.now()).toISOString(),
      text: r.text
    }));

    const { data } = await axios.post(`${mlServiceUrl}/analyze_thread`, {
      item_title: thread.title,
      comments: commentsParam
    });

    res.json(data);
  } catch (err) {
    if (err.response) {
      console.error("ML Analysis Error:", err.response.data);
    } else {
      console.error("ML Analysis Error:", err.message);
    }
    res.status(500).json({ message: 'Error analyzing thread with AI Engine.' });
  }
});

module.exports = router;
