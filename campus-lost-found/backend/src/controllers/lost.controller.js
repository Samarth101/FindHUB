const LostReport = require('../models/LostReport');
const matchingService = require('../services/matching.service');
const notificationService = require('../services/notification.service');

/**
 * POST /api/lost  — create a lost report
 */
async function createLostReport(req, res, next) {
  try {
    const { category, itemName, brand, color, description,
            distinguishingFeatures, location, date } = req.body;

    const report = await LostReport.create({
      student: req.user._id,
      category, itemName, brand, color, description,
      distinguishingFeatures, location,
      dateLost: new Date(date),
    });

    // Kick off async ML matching (don't await — respond immediately)
    matchingService.triggerMatchForLost(report._id).catch(console.error);

    // Notify user to update recent activity
    await notificationService.send({
      recipient: req.user._id,
      type: 'system',
      title: 'Lost Report Created',
      body: `You reported a lost ${itemName}.`
    });

    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/lost/mine  — get caller's own lost reports
 */
async function getMyLostReports(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { student: req.user._id, isDeleted: false };
    if (status) filter.status = status;

    const total = await LostReport.countDocuments(filter);
    const reports = await LostReport.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.set('X-Total-Count', total);
    res.json({ reports, total });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/lost  — admin: get all lost reports
 */
async function getAllLostReports(req, res, next) {
  try {
    const { status, category, page = 1, limit = 20, search } = req.query;
    const filter = { isDeleted: false };
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (search)   filter.$or = [
      { itemName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const total = await LostReport.countDocuments(filter);
    const reports = await LostReport.find(filter)
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.set('X-Total-Count', total);
    res.json({ reports, total });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/lost/:id
 */
async function getLostReportById(req, res, next) {
  try {
    const report = await LostReport.findById(req.params.id)
      .populate('student', 'name email');

    if (!report || report.isDeleted) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Students can only see their own; admins see all
    if (req.user.role === 'student' && !report.student._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    res.json({ report });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/lost/:id  — soft delete (owner or admin)
 */
async function deleteLostReport(req, res, next) {
  try {
    const report = await LostReport.findById(req.params.id);
    if (!report || report.isDeleted) {
      return res.status(404).json({ message: 'Report not found.' });
    }
    if (req.user.role === 'student' && !report.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    report.isDeleted = true;
    report.status = 'closed';
    await report.save();
    res.json({ message: 'Report deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createLostReport, getMyLostReports, getAllLostReports,
  getLostReportById, deleteLostReport,
};
