const rateLimit = require('express-rate-limit');
const { rateLimits } = require('../config/env');

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests. Please slow down and try again later.'
    })
  }
};

const general = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: rateLimits.general,
  message: undefined,
})

const auth = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: rateLimits.auth,
  skipSuccessfulRequests: true,
})

const report = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: rateLimits.report,
});

const verify = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: rateLimits.verify,
});

const communityReply = rateLimit({
  ...base,
  windowMs: 5 * 60 * 1000,
  max: 10,
})

const adminAction = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 200,
});

module.exports = { general, auth, report, verify, communityReply, adminAction }