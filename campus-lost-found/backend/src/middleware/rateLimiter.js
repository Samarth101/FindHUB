const rateLimit = require('express-rate-limit');
const { rateLimits } = require('../config/env');

/** Shared options */
const base = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests. Please slow down and try again later.',
    });
  },
};

/** General API limit */
const general = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,   // 15 min
  max: rateLimits.general,     // 100
  message: undefined,
});

/** Auth endpoints (login / register) */
const auth = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: rateLimits.auth,        // 10
  skipSuccessfulRequests: true,
});

/** Report filing (lost / found) */
const report = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: rateLimits.report,      // 5
});

/** Verification answer submission */
const verify = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: rateLimits.verify,      // 3
});

/** Community replies */
const communityReply = rateLimit({
  ...base,
  windowMs: 5 * 60 * 1000,    // 5 min
  max: 10,
});

/** Admin actions (relaxed) */
const adminAction = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 200,
});

module.exports = { general, auth, report, verify, communityReply, adminAction };
