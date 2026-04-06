const LostReport = require('../models/LostReport')
const matchingService = require('../services/matching.service')

async function createLostReport(req, res, next) {
  try {
    const {
      category,
      itemName,
      brand,
      color,
      description,
      distinguishingFeatures,
      location,
      date,
      locationCoords
    } = req.body

    const report = await LostReport.create({
      student: req.user._id,
      category,
      itemName,
      brand,
      color,
      description,
      distinguishingFeatures,
      location,
      dateLost: new Date(date),
      locationGeo: locationCoords
        ? {
            type: 'Point',
            coordinates: [locationCoords.lng, locationCoords.lat]
          }
        : undefined
    })

    matchingService.triggerMatchForLost(report._id).catch(console.error)

    res.status(201).json({ report })
  } catch (err) {
    next(err)
  }
}

async function getMyLostReports(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = { student: req.user._id, isDeleted: false }
    if (status) filter.status = status

    const total = await LostReport.countDocuments(filter)
    const reports = await LostReport.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.set('X-Total-Count', total)
    res.json({ reports, total })
  } catch (err) {
    next(err)
  }
}

async function getAllLostReports(req, res, next) {
  try {
    const { status, category, page = 1, limit = 20, search } = req.query
    const filter = { isDeleted: false }
    if (status) filter.status = status
    if (category) filter.category = category
    if (search) filter.$or = [
      { itemName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]

    const total = await LostReport.countDocuments(filter)
    const reports = await LostReport.find(filter)
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.set('X-Total-Count', total)
    res.json({ reports, total })
  } catch (err) {
    next(err)
  }
}

async function getLostReportById(req, res, next) {
  try {
    const report = await LostReport.findById(req.params.id)
      .populate('student', 'name email')

    if (!report || report.isDeleted) {
      return res.status(404).json({ message: 'Report not found.' })
    }

    if (req.user.role === 'student' && !report.student._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' })
    }

    res.json({ report })
  } catch (err) {
    next(err)
  }
}

async function deleteLostReport(req, res, next) {
  try {
    const report = await LostReport.findById(req.params.id)
    if (!report || report.isDeleted) {
      return res.status(404).json({ message: 'Report not found.' })
    }
    if (req.user.role === 'student' && !report.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' })
    }

    report.isDeleted = true
    report.status = 'closed'
    await report.save()
    res.json({ message: 'Report deleted.' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createLostReport,
  getMyLostReports,
  getAllLostReports,
  getLostReportById,
  deleteLostReport
}