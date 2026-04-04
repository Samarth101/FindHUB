const Claim    = require('../models/Claim');
const Match    = require('../models/Match');
const Handover = require('../models/Handover');
const LostReport = require('../models/LostReport');
const FoundItem  = require('../models/FoundItem');
const ChatRoom   = require('../models/ChatRoom');
const notifService = require('../services/notification.service');
const auditService = require('../services/audit.service');

/**
 * GET /api/claims  — admin: all claims
 */
async function getAllClaims(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Claim.countDocuments(filter);
    const claims = await Claim.find(filter)
      .populate('claimant',   'name email')
      .populate('lostReport', 'itemName category')
      .populate('foundItem',  'itemName category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.set('X-Total-Count', total);
    res.json({ claims, total });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/claims/mine  — student's own claims
 */
async function getMyClaims(req, res, next) {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('lostReport', 'itemName category')
      .sort({ createdAt: -1 });
    res.json({ claims });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/claims/:id  — admin or owner
 */
async function getClaimById(req, res, next) {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('claimant',   'name email')
      .populate('lostReport', 'itemName category student')
      .populate('foundItem',  'itemName category');

    if (!claim) return res.status(404).json({ message: 'Claim not found.' });

    if (req.user.role === 'student' && !claim.claimant._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    // Students never see the found item details or secret clues
    if (req.user.role === 'student') {
      const safe = claim.toObject();
      delete safe.foundItem;
      delete safe.answers;
      return res.json({ claim: safe });
    }

    res.json({ claim });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/claims/:id/review  — admin approve or reject
 */
async function reviewClaim(req, res, next) {
  try {
    const { decision, note } = req.body;  // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision.' });
    }

    const claim = await Claim.findById(req.params.id)
      .populate('lostReport')
      .populate('foundItem');
    if (!claim) return res.status(404).json({ message: 'Claim not found.' });

    claim.status     = decision;
    claim.reviewedBy = req.user._id;
    claim.reviewNote = note || '';
    claim.resolvedAt = new Date();
    await claim.save();

    const notifType = decision === 'approved' ? 'claim_approved' : 'claim_rejected';
    const notifTitle = decision === 'approved'
      ? '🎉 Claim approved!'
      : 'Claim not approved';
    const notifBody = decision === 'approved'
      ? `Your ownership of "${claim.lostReport.itemName}" has been verified! A handover will be scheduled.`
      : `Your claim for "${claim.lostReport.itemName}" was not approved. Contact admin for details.`;

    await notifService.send({
      recipient: claim.claimant,
      type: notifType,
      title: notifTitle,
      body: notifBody,
      meta: { claimId: claim._id },
    });

    // If approved, update statuses and create handover
    if (decision === 'approved') {
      await LostReport.findByIdAndUpdate(claim.lostReport._id, { status: 'claimed' });
      await FoundItem.findByIdAndUpdate(claim.foundItem._id,   { status: 'claimed' });
      await Match.findByIdAndUpdate(claim.match,               { status: 'verified' });

      // Open a chat room
      const chatRoom = await ChatRoom.create({
        name: `${claim.lostReport.itemName} - Handover`,
        participants: [claim.claimant, ...(claim.foundItem.submittedBy ? [claim.foundItem.submittedBy] : [])],
        claim:      claim._id,
        match:      claim.match,
        lostReport: claim.lostReport._id,
        foundItem:  claim.foundItem._id,
      });

      // Create handover record
      await Handover.create({
        claim:      claim._id,
        lostReport: claim.lostReport._id,
        foundItem:  claim.foundItem._id,
        owner:      claim.claimant,
        finder:     claim.foundItem.submittedBy || null,
        adminSupervised: claim.foundItem.submitterAnonymous || !claim.foundItem.submittedBy,
        coordinatedBy:   req.user._id,
      });

      await auditService.log({
        actor:   req.user._id,
        action:  'Approved claim',
        target:  `Claim:${claim._id}`,
        details: `Approved claim for "${claim.lostReport.itemName}" by ${claim.claimant}`,
        req,
      });
    }

    res.json({ claim });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllClaims, getMyClaims, getClaimById, reviewClaim };
