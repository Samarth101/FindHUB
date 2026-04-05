const router = require('express').Router();
const Notification = require('../models/Notification');
const notifService = require('../services/notification.service');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const result = await notifService.getForUser(req.user._id, {
      page, limit, unreadOnly: unread === 'true',
    });
    res.json(result);
  } catch (err) { next(err); }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await notifService.markAllRead(req.user._id);
    res.json({ message: 'All marked as read.' });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Not found.' });
    res.json({ notification: notif });
  } catch (err) { next(err); }
});

// GET count of unread
router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ count });
  } catch (err) { next(err); }
});

module.exports = router;
