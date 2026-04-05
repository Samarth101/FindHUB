const { nodeEnv } = require('../config/env');

/**
 * Global error handler — must be registered LAST in app.js.
 */
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log unexpected errors
  if (status >= 500) {
    console.error('[ERROR]', err.stack || err.message);
  }

  res.status(status).json({
    message,
    ...(nodeEnv === 'development' && status >= 500 ? { stack: err.stack } : {}),
  });
}

/**
 * Catch-all for unmatched routes.
 */
function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
}

module.exports = { errorHandler, notFound };
