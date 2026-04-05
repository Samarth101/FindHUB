const router = require('express').Router();
const { body } = require('express-validator');
const Handover   = require('../models/Handover');
const LostReport = require('../models/LostReport');
const FoundItem  = require('../models/FoundItem');
const notifService = require('../services/notification.service');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// GET my handovers (student)
router.get('/mine', authenticate, async (req, res, next) => {
  try {
    const handovers = await Handover.find({ owner: req.user._id })
      .populate('lostReport', 'itemName category')
      .sort({ scheduledAt: -1 });
    res.json({ handovers });
  } catch (err) { next(err); }
});

// GET all handovers (admin)
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const total = await Handover.countDocuments(filter);
    const handovers = await Handover.find(filter)
      .populate('owner', 'name email')
      .populate('lostReport', 'itemName category')
      .sort({ scheduledAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ handovers, total });
  } catch (err) { next(err); }
});

// PATCH schedule (admin)
router.patch('/:id/schedule', authenticate, authorize('admin'), [
  body('location').trim().notEmpty(),
  body('scheduledAt').isISO8601(),
], validate, async (req, res, next) => {
  try {
    const { location, scheduledAt, notes } = req.body;
    const handover = await Handover.findById(req.params.id).populate('lostReport');
    if (!handover) return res.status(404).json({ message: 'Not found.' });

    handover.location    = location;
    handover.scheduledAt = new Date(scheduledAt);
    handover.status      = 'scheduled';
    if (notes) handover.notes = notes;
    await handover.save();

    await notifService.send({
      recipient: handover.owner,
      type: 'handover_scheduled',
      title: 'Pickup scheduled!',
      body: `Your item "${handover.lostReport?.itemName}" pickup is scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
      meta: { handoverId: handover._id },
    });

    res.json({ handover });
  } catch (err) { next(err); }
});

// PATCH confirm received (student or admin)
router.patch('/:id/confirm', authenticate, async (req, res, next) => {
  try {
    const handover = await Handover.findById(req.params.id)
      .populate('lostReport')
      .populate('foundItem');
    if (!handover) return res.status(404).json({ message: 'Not found.' });

    if (req.user.role === 'student') {
      if (!handover.owner.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden.' });
      handover.confirmedByOwner = true;
    } else {
      handover.confirmedByFinder = true;
      handover.confirmedByOwner  = true;
    }

    if (handover.confirmedByOwner) {
      handover.status      = 'completed';
      handover.completedAt = new Date();

      await LostReport.findByIdAndUpdate(handover.lostReport._id, { status: 'returned' });
      await FoundItem.findByIdAndUpdate(handover.foundItem._id,   { status: 'returned' });
    }

    await handover.save();
    res.json({ handover });
  } catch (err) { next(err); }
});

module.exports = router;
