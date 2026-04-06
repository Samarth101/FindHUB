const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/lost.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const limits = require('../middleware/rateLimiter');

const reportRules = [
  body('category').notEmpty().withMessage('Category is required'),
  body('itemName').trim().notEmpty().isLength({ max: 120 }),
  body('location').trim().notEmpty().isLength({ max: 200 }),
  body('date').isISO8601().withMessage('Valid date required'),
];

router.get('/mine', authenticate, ctrl.getMyLostReports);

router.get('/', authenticate, authorize('admin'), ctrl.getAllLostReports);

router.post('/', authenticate, limits.report, reportRules, validate, ctrl.createLostReport);

router.get('/:id', authenticate, ctrl.getLostReportById);

router.delete('/:id', authenticate, ctrl.deleteLostReport);

module.exports = router;
