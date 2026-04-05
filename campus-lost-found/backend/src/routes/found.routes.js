const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/found.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const limits = require('../middleware/rateLimiter');

const intakeRules = [
  body('category').notEmpty(),
  body('itemName').trim().notEmpty().isLength({ max: 120 }),
  body('location').trim().notEmpty().isLength({ max: 200 }),
  body('date').isISO8601(),
  body('secretClues').isArray({ min: 1 }).withMessage('At least 1 secret clue required'),
  body('secretClues.*.text').trim().notEmpty().isLength({ max: 500 }),
];

// Admin ONLY: list all found items
router.get('/', authenticate, authorize('admin'), ctrl.getAllFoundItems);
router.get('/:id', authenticate, authorize('admin'), ctrl.getFoundItemById);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteFoundItem);

// Students and admins can submit found items (rate-limited)
router.post('/', authenticate, limits.report, intakeRules, validate, ctrl.createFoundItem);

module.exports = router;
