const AuditLog = require('../models/AuditLog');

/**
 * Record an admin action in the audit log.
 *
 * @param {Object} params
 * @param {ObjectId} params.actor      — admin user ID
 * @param {string}   params.action     — short action name, e.g. 'Approved claim'
 * @param {string}   [params.target]   — "Model:id" string
 * @param {string}   [params.details]  — longer description
 * @param {Object}   [params.req]      — Express request (for IP/UA)
 * @param {string}   [params.severity] — 'low' | 'medium' | 'high'
 * @param {Object}   [params.metadata] — arbitrary extra data
 */
async function log({ actor, action, target = '', details = '', req, severity = 'low', metadata = {} }) {
  await AuditLog.create({
    actor,
    action,
    target,
    details,
    ipAddress: req?.ip || '',
    userAgent: req?.get('user-agent') || '',
    severity,
    metadata,
  });
}

module.exports = { log };
