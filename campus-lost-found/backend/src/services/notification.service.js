const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../config/socket');

/**
 * Send a notification to a specific user.
 * Also emits real-time via Socket.io if the user is connected.
 */
async function send({ recipient, type, title, body, meta = {} }) {
  const notif = await Notification.create({ recipient, type, title, body, meta });

  // Real-time push (best effort — don't fail if socket not ready)
  try {
    const io = getIO();
    io.to(`user:${recipient.toString()}`).emit('notification', notif);
  } catch {
    // Socket not initialized yet — fine, polling will catch it
  }

  return notif;
}

/**
 * Send a notification to ALL admin users.
 */
async function sendAdmins({ type, title, body, meta = {} }) {
  const admins = await User.find({ role: 'admin', isBanned: false }).select('_id');
  await Promise.all(admins.map(admin =>
    send({ recipient: admin._id, type, title, body, meta })
  ));
}

/**
 * GET /api/notifications  (called by controller, not directly)
 */
async function getForUser(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
  const filter = { recipient: userId };
  if (unreadOnly) filter.isRead = false;

  const total = await Notification.countDocuments(filter);
  const items = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return { notifications: items, total };
}

/**
 * Mark all unread notifications as read for a user.
 */
async function markAllRead(userId) {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
}

module.exports = { send, sendAdmins, getForUser, markAllRead };
