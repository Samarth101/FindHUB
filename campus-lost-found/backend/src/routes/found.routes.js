const router = require('express').Router()
const { body } = require('express-validator')
const ctrl = require('../controllers/found.controller')
const { authenticate, authorize } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const limits = require('../middleware/rateLimiter')

const intakeRules = [
  body('category').notEmpty(),
  body('itemName').trim().notEmpty().isLength({ max: 120 }),
  body('location').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
  body('date').notEmpty(),
  body('secretClues').isArray({ min: 1 }),
  body('secretClues.*.text').trim().notEmpty().isLength({ max: 500 })
]

router.get('/', authenticate, ctrl.getMyFoundItems)
router.get('/:id', authenticate, ctrl.getFoundItemById)
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteFoundItem)

router.post('/', authenticate, limits.report, intakeRules, validate, ctrl.createFoundItem)

module.exports = router