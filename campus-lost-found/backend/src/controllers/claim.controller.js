const Claim = require('../models/Claim')
const Match = require('../models/Match')
const Handover = require('../models/Handover')
const LostReport = require('../models/LostReport')
const FoundItem = require('../models/FoundItem')
const ChatRoom = require('../models/ChatRoom')
const notifService = require('../services/notification.service')
const auditService = require('../services/audit.service')
const mailer = require('../services/mailer.service')

async function getAllClaims(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status) filter.status = status

    const total = await Claim.countDocuments(filter)
    const claims = await Claim.find(filter)
      .populate('claimant', 'name email')
      .populate('lostReport', 'itemName category')
      .populate('foundItem', 'itemName category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.set('X-Total-Count', total)
    res.json({ claims, total })
  } catch (err) {
    next(err)
  }
}

async function getMyClaims(req, res, next) {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('lostReport', 'itemName category')
      .sort({ createdAt: -1 })
    res.json({ claims })
  } catch (err) {
    next(err)
  }
}

async function getClaimById(req, res, next) {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('claimant', 'name email')
      .populate('lostReport', 'itemName category student')
      .populate('foundItem', 'itemName category')

    if (!claim) return res.status(404).json({ message: 'Claim not found.' })

    if (req.user.role === 'student' && !claim.claimant._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' })
    }

    if (req.user.role === 'student') {
      const safe = claim.toObject()
      delete safe.foundItem
      delete safe.answers
      return res.json({ claim: safe })
    }

    res.json({ claim })
  } catch (err) {
    next(err)
  }
}

async function reviewClaim(req, res, next) {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('lostReport')
      .populate('foundItem')
      .populate('claimant', 'name email')

    if (!claim) return res.status(404).json({ message: 'Claim not found.' })

    const isMatch = true

    claim.status = isMatch ? 'approved' : 'rejected'
    claim.resolvedAt = new Date()
    await claim.save()

    await notifService.send({
      recipient: claim.claimant,
      type: isMatch ? 'claim_approved' : 'claim_rejected',
      title: isMatch ? '🎉 Match found!' : 'No match found',
      body: isMatch
        ? `A match has been found for "${claim.lostReport.itemName}".`
        : `No match found for "${claim.lostReport.itemName}".`,
      meta: { claimId: claim._id }
    })

    try {
      let finder = null

      if (isMatch) {
        const foundItem = await FoundItem.findById(claim.foundItem._id).populate('submittedBy', 'name email')
        if (foundItem?.submittedBy) {
          finder = {
            name: foundItem.submittedBy.name,
            email: foundItem.submittedBy.email
          }
        }
      }

      await mailer.sendClaimResult({
        user: claim.claimant,
        item: claim.lostReport,
        isMatch,
        finder
      })
    } catch (err) {
      console.error('Email failed:', err.message)
    }

    if (isMatch) {
      await LostReport.findByIdAndUpdate(claim.lostReport._id, { status: 'claimed' })
      await FoundItem.findByIdAndUpdate(claim.foundItem._id, { status: 'claimed' })
      await Match.findByIdAndUpdate(claim.match, { status: 'verified' })

      await ChatRoom.create({
        name: `${claim.lostReport.itemName} - Handover`,
        participants: [claim.claimant, ...(claim.foundItem.submittedBy ? [claim.foundItem.submittedBy] : [])],
        claim: claim._id,
        match: claim.match,
        lostReport: claim.lostReport._id,
        foundItem: claim.foundItem._id
      })

      await Handover.create({
        claim: claim._id,
        lostReport: claim.lostReport._id,
        foundItem: claim.foundItem._id,
        owner: claim.claimant,
        finder: claim.foundItem.submittedBy || null,
        adminSupervised: claim.foundItem.submitterAnonymous || !claim.foundItem.submittedBy,
        coordinatedBy: req.user._id
      })

      await auditService.log({
        actor: req.user._id,
        action: 'Auto verified claim',
        target: `Claim:${claim._id}`,
        details: `Auto verified claim for "${claim.lostReport.itemName}"`,
        req
      })
    }

    res.json({ claim })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllClaims, getMyClaims, getClaimById, reviewClaim }