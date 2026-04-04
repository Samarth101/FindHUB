const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/claim.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get('/mine', authenticate, ctrl.getMyClaims);
router.get('/', authenticate, authorize('admin'), ctrl.getAllClaims);
router.get('/:id', authenticate, ctrl.getClaimById);
router.patch('/:id/review', authenticate, authorize('admin'), [
  body('decision').isIn(['approved', 'rejected']),
  body('note').optional().isString(),
], validate, ctrl.reviewClaim);

module.exports = router;
