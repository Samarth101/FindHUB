/**
 * Privacy rules:
 * - FOUND items are NEVER exposed to non-admin users.
 * - When generating community threads from lost reports, these fields are stripped.
 * - Verification answers and secret clues are never exposed to claimants.
 */

const PRIVATE_FOUND_FIELDS = [
  'submittedBy', 'submitterAnonymous', 'secretClues',
  'images', 'brand', 'model',
];

// Fields safe to include in public community threads
const THREAD_SAFE_LOST_FIELDS = [
  'category', 'color', 'location', 'date', 'description',
];

// Fields stripped when returning match info to a student
const HIDDEN_MATCH_FIELDS = [
  'foundItemId', 'foundItem', 'secretClues', 'finderIdentity',
];

/**
 * Sanitize a found item object before any non-admin exposure (should never
 * happen, but as a last defence).
 */
function sanitizeFoundItem(item) {
  const obj = item?.toObject ? item.toObject() : { ...item };
  PRIVATE_FOUND_FIELDS.forEach(f => delete obj[f]);
  return obj;
}

/**
 * Strip found-item details from a match object before sending to student.
 */
function sanitizeMatchForStudent(match) {
  const obj = match?.toObject ? match.toObject() : { ...match };
  HIDDEN_MATCH_FIELDS.forEach(f => delete obj[f]);
  return obj;
}

module.exports = {
  PRIVATE_FOUND_FIELDS,
  THREAD_SAFE_LOST_FIELDS,
  HIDDEN_MATCH_FIELDS,
  sanitizeFoundItem,
  sanitizeMatchForStudent,
};
