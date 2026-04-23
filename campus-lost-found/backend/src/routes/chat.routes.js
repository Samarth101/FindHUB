const router = require('express').Router();
const { body } = require('express-validator');
const ChatRoom = require('../models/ChatRoom');
const { authenticate, authorize } = require('../middleware/auth');
const { getIO } = require('../config/socket');
const { validate } = require('../middleware/validate');

// GET rooms for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const rooms = await ChatRoom.find({
      participants: req.user._id,
      isArchived: false,
    })
      .select('-messages')
      .sort({ lastActivity: -1 });
    res.json({ rooms });
  } catch (err) { next(err); }
});

// GET single room (participant only)
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const room = await ChatRoom.findById(req.params.id)
      .populate('messages.sender', 'name avatar');
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    const isMember = room.participants.some(p => p.equals(req.user._id));
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    // Mark messages as read
    room.messages.forEach(m => {
      if (!m.readBy.includes(req.user._id)) m.readBy.push(req.user._id);
    });
    await room.save();
    res.json({ room });
  } catch (err) { next(err); }
});

// POST a message
router.post('/:id/messages', authenticate, [
  body('text').trim().notEmpty().isLength({ max: 2000 }),
], validate, async (req, res, next) => {
  try {
    const room = await ChatRoom.findById(req.params.id).populate('participants', 'name email');
    if (!room || room.isClosed) return res.status(404).json({ message: 'Room unavailable.' });

    const isMember = room.participants.some(p => p.equals(req.user._id));
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const msg = { sender: req.user._id, text: req.body.text, readBy: [req.user._id] };
    room.messages.push(msg);
    room.lastMessage  = req.body.text;
    room.lastActivity = new Date();
    await room.save();

    const newMsg = room.messages[room.messages.length - 1];

    // Emit to room via Socket.io
    let clientsInRoom = 0;
    try {
      const io = getIO();
      io.to(`room:${room._id}`).emit('message', {
        ...newMsg.toObject(),
        sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
      });
      const roomClients = io.sockets.adapter.rooms.get(`room:${room._id}`);
      clientsInRoom = roomClients ? roomClients.size : 0;
    } catch { /* socket not ready */ }

    // If there's only 1 client (the sender) in the room, the other(s) are offline.
    if (clientsInRoom < 2) {
      const mailService = require('../services/mail.service');
      const recipients = room.participants.filter(p => !p._id.equals(req.user._id));
      for (const recipient of recipients) {
        mailService.sendChatMessageNotification(recipient, req.user.name, room.name).catch(err => console.error('Chat email failed:', err));
      }
    }

    res.status(201).json({ message: newMsg });
  } catch (err) { next(err); }
});

// Admin: list all rooms
router.get('/admin/all', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const rooms = await ChatRoom.find()
      .populate('participants', 'name email role')
      .select('-messages')
      .sort({ lastActivity: -1 });
    res.json({ rooms });
  } catch (err) { next(err); }
});

module.exports = router;
