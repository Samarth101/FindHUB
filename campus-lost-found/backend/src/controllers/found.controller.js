const FoundItem  = require('../models/FoundItem');
const matchingService = require('../services/matching.service');
const { sanitizeFoundItem } = require('../constants/privacy');

/**
 * POST /api/found  — admin intake / student self-report
 * Found items go directly into the hidden database.
 */
async function createFoundItem(req, res, next) {
  try {
    const {
      category, itemName, brand, color, description,
      location, date, secretClues, submitterAnonymous,
    } = req.body;

    const item = await FoundItem.create({
      submittedBy:  req.user.role === 'admin' ? null : req.user._id,
      intakeAdmin:  req.user.role === 'admin' ? req.user._id : null,
      submitterAnonymous: !!submitterAnonymous,
      category, itemName, brand, color, description, location,
      dateFound: new Date(date),
      secretClues: secretClues || [],
    });

    // Kick off async ML matching against all open lost reports
    matchingService.triggerMatchForFound(item._id).catch(console.error);

    // Admin sees full item; students just get confirmation (no details)
    if (req.user.role === 'admin') {
      return res.status(201).json({ item });
    }
    res.status(201).json({ message: 'Found item recorded. Thank you!' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/found  — ADMIN ONLY — full found item list
 */
async function getAllFoundItems(req, res, next) {
  try {
    const { status, category, page = 1, limit = 20, search } = req.query;
    const filter = { isDeleted: false };
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { itemName: { $regex: search, $options: 'i' } },
    ];

    const total = await FoundItem.countDocuments(filter);
    const items  = await FoundItem.find(filter)
      .populate('submittedBy',  'name email')
      .populate('intakeAdmin',  'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.set('X-Total-Count', total);
    res.json({ items, total });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/found/:id  — ADMIN ONLY
 */
async function getFoundItemById(req, res, next) {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('intakeAdmin', 'name');

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Found item not found.' });
    }
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/found/:id  — ADMIN ONLY
 */
async function deleteFoundItem(req, res, next) {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Not found.' });
    }
    item.isDeleted = true;
    item.status = 'archived';
    await item.save();
    res.json({ message: 'Found item archived.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createFoundItem, getAllFoundItems, getFoundItemById, deleteFoundItem,
};
