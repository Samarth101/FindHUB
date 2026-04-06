const Match      = require('../models/Match');
const Claim      = require('../models/Claim');
const FoundItem  = require('../models/FoundItem');
const LostReport = require('../models/LostReport');
const Notification = require('../models/Notification');
const verifyService = require('../services/verify.service');
const notifService  = require('../services/notification.service');
const { sanitizeMatchForStudent } = require('../constants/privacy');

/**
 * GET /api/matches/mine  — matches for the logged-in student (no found details)
 */
async function getMyMatches(req, res, next) {
  try {
    const myReports = await LostReport.find({ student: req.user._id }).select('_id');
    const ids = myReports.map(r => r._id);

    const matches = await Match.find({
      lostReport: { $in: ids },
      status: { $ne: 'closed' },
    })
      .populate('lostReport', 'itemName category dateLost status')
      .sort({ score: -1, createdAt: -1 });

    // Strip all found-item details before sending
    const safe = matches.map(m => sanitizeMatchForStudent(m));
    res.json({ matches: safe });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/matches/:id — get a specific match for the student
 * Generates AI verification questions on the fly.
 */
async function getMatchById(req, res, next) {
  try {
    const match = await Match.findById(req.params.id)
      .populate('lostReport')
      .populate('foundItem');

    if (!match) return res.status(404).json({ message: 'Match not found.' });

    // Privacy check
    if (!match.lostReport.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    // Generate questions using AI service
    const questions = await verifyService.generateQuestions(
      match.foundItem.category,
      match.foundItem.secretClues
    );

    res.json({ 
      match: sanitizeMatchForStudent(match), 
      questions 
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/matches  — admin: full match list with both sides
 */
async function getAllMatches(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Match.countDocuments(filter);
    const matches = await Match.find(filter)
      .populate('lostReport', 'itemName category student')
      .populate('foundItem',  'itemName category location')
      .sort({ score: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.set('X-Total-Count', total);
    res.json({ matches, total });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/matches/:id/review  — admin manual review decision
 */
async function reviewMatch(req, res, next) {
  try {
    const { decision, note } = req.body;  // decision: 'verified' | 'rejected'
    if (!['verified', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision.' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found.' });

    match.status     = decision;
    match.reviewedBy = req.user._id;
    match.reviewNote = note || '';
    await match.save();

    // If verified, notify the student
    if (decision === 'verified') {
      const report = await LostReport.findById(match.lostReport);
      if (report) {
        await notifService.send({
          recipient: report.student,
          type: 'match',
          title: 'Match verified by admin!',
          body:  `Your report for "${report.itemName}" was confirmed as a match.`,
          meta:  { matchId: match._id },
        });
      }
    }

    res.json({ match });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/matches/:id/claim  — student submits verification answers
 */
async function submitClaim(req, res, next) {
  try {
    const { answers } = req.body;  // [{ questionId, question, answer }]
    const match = await Match.findById(req.params.id)
      .populate('lostReport')
      .populate('foundItem');

    if (!match) return res.status(404).json({ message: 'Match not found.' });

    // Ensure the match belongs to this student
    if (!match.lostReport.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    // Check no existing claim
    const existing = await Claim.findOne({ match: match._id, claimant: req.user._id });
    if (existing) return res.status(409).json({ message: 'Claim already submitted.' });

    // Grade answers against secret clues using ML
    const { verifyScore, scoredAnswers, status, aiReason } = await verifyService.gradeAnswers(
      match.foundItem.category,
      answers,
      match.foundItem.secretClues
    );

    match.status = status; // Auto-update match status based on claim result
    await match.save();

    const claim = await Claim.create({
      match:       match._id,
      claimant:    req.user._id,
      lostReport:  match.lostReport._id,
      foundItem:   match.foundItem._id,
      answers:     scoredAnswers,
      verifyScore,
      status,
      reviewNote:  aiReason || '',
    });

    // Notify admins if needs review
    if (status === 'review') {
      await notifService.sendAdmins({
        type: 'claim_review',
        title: 'Claim needs review',
        body:  `Claim for "${match.lostReport.itemName}" scored ${Math.round(verifyScore * 100)}%.`,
        meta:  { claimId: claim._id },
      });
    }

    res.status(201).json({ claim: { _id: claim._id, status, verifyScore } });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  getMyMatches, 
  getMatchById,
  getAllMatches, 
  reviewMatch, 
  submitClaim 
};
