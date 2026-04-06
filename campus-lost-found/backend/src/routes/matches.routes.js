const router = require('express').Router()
const ctrl = require('../controllers/match.controller')
const { authenticate, authorize } = require('../middleware/auth')

router.get('/mine', authenticate, ctrl.getMyMatches)
router.get('/', authenticate, authorize('admin'), ctrl.getAllMatches)
router.patch('/:id/review', authenticate, authorize('admin'), ctrl.reviewMatch)
router.post('/:id/claim', authenticate, ctrl.submitClaim)

module.exports = router