const router = require('express').Router();
const { body } = require('express-validator');
const ctrl     = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate }   = require('../middleware/validate');
const limits = require('../middleware/rateLimiter');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be ≥ 8 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', limits.auth, registerRules, validate, ctrl.register);
router.post('/login',    limits.auth, loginRules,    validate, ctrl.login);
router.get ('/me',       authenticate, ctrl.me);
router.post('/logout',   authenticate, ctrl.logout);
router.put ('/profile',  authenticate, [
  body('name').optional().trim().isLength({ min: 1, max: 80 }),
  body('phone').optional().trim(),
], validate, ctrl.updateProfile);

module.exports = router;
