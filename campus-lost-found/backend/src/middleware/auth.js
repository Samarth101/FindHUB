const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');

/**
 * Verify JWT and attach `req.user` to the request.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: 'User not found.' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'Account suspended. Contact admin.' });
    }

    req.user = user;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
    return res.status(401).json({ message: msg });
  }
}

/**
 * Role guard — must be used AFTER authenticate().
 * Usage: authorize('admin') or authorize('student', 'admin')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. Insufficient role.' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
