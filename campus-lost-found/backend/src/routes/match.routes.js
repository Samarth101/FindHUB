const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/match.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const limits = require('../middleware/rateLimiter');

// Student: view own matches (no found details)
router.get('/mine', authenticate, ctrl.getMyMatches);

// Admin: full list
router.get('/', authenticate, authorize('admin'), ctrl.getAllMatches);

// Admin: manual review decision
router.patch('/:id/review', authenticate, authorize('admin'), [
  body('decision').isIn(['verified', 'rejected']),
  body('note').optional().isString(),
], validate, ctrl.reviewMatch);

// Student: get AI-generated verification questions for a match
router.get('/:id/questions', authenticate, authorize('student'), ctrl.getVerificationQuestions);

// Student: submit claim (verification answers)
router.post('/:id/claim', authenticate, authorize('student'), limits.verify, [
  body('answers').isArray({ min: 1 }).withMessage('Answers required'),
  body('answers.*.questionId').notEmpty(),
  body('answers.*.answer').trim().notEmpty().isLength({ max: 1000 }),
], validate, ctrl.submitClaim);

module.exports = router;

