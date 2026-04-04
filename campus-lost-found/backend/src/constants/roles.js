/**
 * ROLES — single source of truth for role strings.
 */
const ROLES = {
  STUDENT: 'student',
  ADMIN:   'admin',
};

const ALL_ROLES = Object.values(ROLES);

module.exports = { ROLES, ALL_ROLES };
