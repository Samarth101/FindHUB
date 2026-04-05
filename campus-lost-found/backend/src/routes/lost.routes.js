const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/lost.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const limits = require('../middleware/rateLimiter');

const reportRules = [
  body('category').notEmpty().withMessage('Category is required'),
  body('itemName').trim().notEmpty().isLength({ max: 120 }),
  body('location').trim().notEmpty().isLength({ max: 200 }),
  body('date').isISO8601().withMessage('Valid date required'),
];

// Student: my reports
router.get('/mine', authenticate, ctrl.getMyLostReports);

// Admin: all reports
router.get('/', authenticate, authorize('admin'), ctrl.getAllLostReports);

// Create (students, rate-limited)
router.post('/', authenticate, limits.report, reportRules, validate, ctrl.createLostReport);

// Get single (owner or admin)
router.get('/:id', authenticate, ctrl.getLostReportById);

// Delete (owner or admin)
router.delete('/:id', authenticate, ctrl.deleteLostReport);

module.exports = router;
