const FoundItem = require('../models/FoundItem')
const matchingService = require('../services/matching.service')

async function createFoundItem(req, res, next) {
  try {
    const {
      category, itemName, brand, color, description,
      location, locationCoords, date, secretClues, submitterAnonymous,
    } = req.body;

    const item = await FoundItem.create({
      submittedBy: req.user.role === 'admin' ? null : req.user._id,
      intakeAdmin: req.user.role === 'admin' ? req.user._id : null,
      submitterAnonymous: !!submitterAnonymous,
      category, itemName, brand, color, description, location, locationCoords,
      dateFound: new Date(date),
      images: images || [],
      secretClues: (secretClues || []).map(c => ({
        text: c.text.trim()
      }))
    })

    matchingService.triggerMatchForFound(item._id).catch(console.error)

    if (req.user.role === 'admin') {
      return res.status(201).json({ item })
    }

    res.status(201).json({ message: 'Found item recorded. Thank you!' })
  } catch (err) {
    next(err)
  }
}

async function getMyFoundItems(req, res, next) {
  try {
    const items = await FoundItem.find({
      isDeleted: false,
      submittedBy: req.user._id
    }).sort({ createdAt: -1 })

    res.json({ items })
  } catch (err) {
    next(err)
  }
}

async function getFoundItemById(req, res, next) {
  try {
    const item = await FoundItem.findById(req.params.id)

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Found item not found.' })
    }

    if (
      req.user.role !== 'admin' &&
      item.submittedBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ item })
  } catch (err) {
    next(err)
  }
}

async function getAllFoundItems(req, res, next) {
  try {
    const { status, category, page = 1, limit = 20, search } = req.query
    const filter = { isDeleted: false }

    if (status) filter.status = status
    if (category) filter.category = category
    if (search) {
      filter.$or = [
        { itemName: { $regex: search, $options: 'i' } }
      ]
    }

    const total = await FoundItem.countDocuments(filter)

    const items = await FoundItem.find(filter)
      .populate('submittedBy', 'name email')
      .populate('intakeAdmin', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.set('X-Total-Count', total)
    res.json({ items, total })
  } catch (err) {
    next(err)
  }
}

async function deleteFoundItem(req, res, next) {
  try {
    const item = await FoundItem.findById(req.params.id)

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Not found.' })
    }

    item.isDeleted = true
    item.status = 'archived'
    await item.save()

    res.json({ message: 'Found item archived.' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createFoundItem,
  getMyFoundItems,
  getFoundItemById,
  getAllFoundItems,
  deleteFoundItem
}