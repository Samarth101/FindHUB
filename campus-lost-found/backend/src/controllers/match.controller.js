const Match = require('../models/Match')
const Claim = require('../models/Claim')
const FoundItem = require('../models/FoundItem')
const LostReport = require('../models/LostReport')
const Notification = require('../models/Notification')
const verifyService = require('../services/verify.service')
const notifService = require('../services/notification.service')
const { sanitizeMatchForStudent } = require('../constants/privacy')

async function getMyMatches(req, res, next) {
  try {
    const myReports = await LostReport.find({ student: req.user._id }).select('_id')
    const ids = myReports.map(r => r._id)

    const matches = await Match.find({
      lostReport: { $in: ids },
      status: { $ne: 'closed' }
    })
      .populate('lostReport', 'itemName category dateLost status')
      .sort({ score: -1, createdAt: -1 })

    const safe = matches.map(m => sanitizeMatchForStudent(m))
    res.json({ matches: safe })
  } catch (err) {
    next(err)
  }
}

async function getAllMatches(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status) filter.status = status

    const total = await Match.countDocuments(filter)
    const matches = await Match.find(filter)
      .populate('lostReport', 'itemName category student')
      .populate('foundItem', 'itemName category location')
      .sort({ score: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.set('X-Total-Count', total)
    res.json({ matches, total })
  } catch (err) {
    next(err)
  }
}

async function reviewMatch(req, res, next) {
  try {
    const { decision, note } = req.body
    if (!['verified', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision.' })
    }

    const match = await Match.findById(req.params.id)
    if (!match) return res.status(404).json({ message: 'Match not found.' })

    match.status = decision
    match.reviewedBy = req.user._id
    match.reviewNote = note || ''
    await match.save()

    if (decision === 'verified') {
      const report = await LostReport.findById(match.lostReport)
      if (report) {
        await notifService.send({
          recipient: report.student,
          type: 'match',
          title: 'Match verified by admin!',
          body: `Your report for "${report.itemName}" was confirmed as a match.`,
          meta: { matchId: match._id }
        })
      }
    }

    res.json({ match })
  } catch (err) {
    next(err)
  }
}

async function submitClaim(req, res, next) {
  try {
    const { answers } = req.body
    const match = await Match.findById(req.params.id)
      .populate('lostReport')
      .populate('foundItem')

    if (!match) return res.status(404).json({ message: 'Match not found.' })

    if (!match.lostReport.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' })
    }

    const existing = await Claim.findOne({ match: match._id, claimant: req.user._id })
    if (existing) return res.status(409).json({ message: 'Claim already submitted.' })

    const { verifyScore, scoredAnswers, status } = await verifyService.gradeAnswers(
      answers,
      match.foundItem.secretClues
    )

    const claim = await Claim.create({
      match: match._id,
      claimant: req.user._id,
      lostReport: match.lostReport._id,
      foundItem: match.foundItem._id,
      answers: scoredAnswers,
      verifyScore,
      status
    })

    if (status === 'review') {
      await notifService.sendAdmins({
        type: 'claim_review',
        title: 'Claim needs review',
        body: `Claim for "${match.lostReport.itemName}" scored ${Math.round(verifyScore * 100)}%.`,
        meta: { claimId: claim._id }
      })
    }

    res.status(201).json({ claim: { _id: claim._id, status, verifyScore } })
  } catch (err) {
    next(err)
  }
}
async function getVerificationQuestions(req, res, next) {
  try {
    const match = await Match.findById(req.params.id)
      .populate('lostReport')
      .populate('foundItem')

    if (!match) return res.status(404).json({ message: 'Match not found.' })

    if (!match.lostReport.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' })
    }

    const secretClues = match.foundItem.secretClues || []
    if (secretClues.length === 0) {
      return res.json({ questions: [
        { id: 'q1', text: 'Describe a unique feature or mark on this item that only the owner would know.' },
        { id: 'q2', text: 'What brand or model is this item?' },
        { id: 'q3', text: 'Describe where exactly you last had this item.' },
      ]})
    }

    const questions = await verifyService.generateQuestions(secretClues)
    res.json({ questions })
  } catch (err) {
    next(err)
  }
}

module.exports = { getMyMatches, getAllMatches, reviewMatch, submitClaim, getVerificationQuestions }