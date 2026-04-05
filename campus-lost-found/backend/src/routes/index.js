const express = require('express');
const { general } = require('../middleware/rateLimiter');
const { errorHandler, notFound } = require('../middleware/errorHandler');
const authRoutes = require('./auth.routes');
const lostRoutes = require('./lost.routes');
const foundRoutes = require('./found.routes');
const claimRoutes = require('./claim.routes');
const communityRoutes = require('./community.routes');
const chatRoutes = require('./chat.routes');
const notifRoutes = require('./notification.routes');
const handoverRoutes = require('./handover.routes');
const adminRoutes = require('./admin.routes');
const upload = require('../middleware/upload')
const { authenticate } = require('../middleware/auth')
const path = require('path');

const router = express.Router()

router.use('/api', general);
router.get('/health', (req, res) => res.json({ status: 'ok' }))
router.use('/api/auth', authRoutes)
router.use('/api/lost', lostRoutes)
router.use('/api/found', foundRoutes)
router.use('/api/claims', claimRoutes)
router.use('/api/community', communityRoutes)
router.use('/api/chat', chatRoutes)
router.use('/api/notifications', notifRoutes)
router.use('/api/handovers', handoverRoutes)
router.use('/api/admin', adminRoutes)
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
router.post('/api/upload', authenticate, upload.array('images', 3), (req, res) => {
  const urls = (req.files || []).map(f => `/uploads/${f.filename}`)
  res.json({ urls })
})
router.use(notFound)
router.use(errorHandler)

module.exports = router