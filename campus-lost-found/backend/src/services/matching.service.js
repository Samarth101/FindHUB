const axios      = require('axios');
const LostReport = require('../models/LostReport');
const FoundItem  = require('../models/FoundItem');
const Match      = require('../models/Match');
const Notification = require('../models/Notification');
const notifService = require('./notification.service');
const { mlServiceUrl } = require('../config/env');

// Minimum cosine similarity to create a match record
const MATCH_THRESHOLD = 0.60;
// Score above which a match is auto-notified to student
const AUTO_NOTIFY_THRESHOLD = 0.80;

/**
 * Call ML service to get an embedding for a text.
 * Falls back to empty array if service unreachable (graceful degradation).
 */
async function getEmbedding(text) {
  try {
    const { data } = await axios.post(`${mlServiceUrl}/embed`, { text }, { timeout: 10000 });
    return data.embedding || [];
  } catch (err) {
    console.warn('[ML] Embedding service unreachable:', err.message);
    return [];
  }
}

/**
 * Call ML service to compute similarity between two texts.
 */
async function getSimilarity(textA, textB) {
  try {
    const { data } = await axios.post(`${mlServiceUrl}/similarity`, { textA, textB }, { timeout: 10000 });
    return data.score || 0;
  } catch {
    // Naive fallback: Jaccard over words
    const setA = new Set(textA.toLowerCase().split(/\s+/));
    const setB = new Set(textB.toLowerCase().split(/\s+/));
    const intersection = [...setA].filter(w => setB.has(w)).length;
    return intersection / (setA.size + setB.size - intersection);
  }
}

/**
 * Build a normalized text blob from a lost report for embedding/similarity.
 */
function lostReportText(report) {
  return [
    report.category, report.itemName, report.brand,
    report.color, report.description, report.distinguishingFeatures,
    report.location,
  ].filter(Boolean).join(' ');
}

/**
 * Build text blob from a found item (excludes secretClues for privacy).
 */
function foundItemText(item) {
  return [
    item.category, item.itemName, item.brand,
    item.color, item.description, item.location,
  ].filter(Boolean).join(' ');
}

/**
 * Trigger matching when a NEW LOST REPORT is filed.
 * Scans all unmatched found items and creates Match records.
 */
async function triggerMatchForLost(lostReportId) {
  const report = await LostReport.findById(lostReportId);
  if (!report) return;

  const foundItems = await FoundItem.find({ status: 'unmatched', isDeleted: false });
  const reportText = lostReportText(report);

  const newMatches = [];

  for (const item of foundItems) {
    // Same category filter (fast pre-filter)
    if (report.category !== item.category) continue;

    const itemText = foundItemText(item);
    const score = await getSimilarity(reportText, itemText);

    if (score >= MATCH_THRESHOLD) {
      // Upsert — avoid duplicates if job runs twice
      const existing = await Match.findOne({ lostReport: report._id, foundItem: item._id });
      if (!existing) {
        const match = await Match.create({
          lostReport: report._id,
          foundItem:  item._id,
          score,
          status: 'pending_verify',
        });
        newMatches.push({ match, item, score });

        // Update item status
        if (item.status === 'unmatched') {
          item.status = 'matched';
          await item.save();
        }
      }
    }
  }

  if (newMatches.length > 0) {
    // Update report status
    report.status = 'matched';
    await report.save();

    // Notify student of best match
    const best = newMatches.sort((a, b) => b.score - a.score)[0];
    if (best.score >= AUTO_NOTIFY_THRESHOLD) {
      await notifService.send({
        recipient: report.student,
        type: 'match',
        title: 'Potential match found!',
        body:  `We found a ${Math.round(best.score * 100)}% match for your ${report.itemName}. Verify ownership now.`,
        meta:  { matchId: best.match._id },
      });
    }
  }

  return newMatches.length;
}

/**
 * Trigger matching when a NEW FOUND ITEM is added.
 * Scans all searching lost reports.
 */
async function triggerMatchForFound(foundItemId) {
  const item = await FoundItem.findById(foundItemId);
  if (!item) return;

  const reports = await LostReport.find({ status: 'searching', isDeleted: false });
  const itemText = foundItemText(item);

  for (const report of reports) {
    if (report.category !== item.category) continue;

    const reportText = lostReportText(report);
    const score = await getSimilarity(reportText, itemText);

    if (score >= MATCH_THRESHOLD) {
      const existing = await Match.findOne({ lostReport: report._id, foundItem: item._id });
      if (!existing) {
        const match = await Match.create({
          lostReport: report._id,
          foundItem:  item._id,
          score,
          status: 'pending_verify',
        });

        report.status = 'matched';
        await report.save();

        if (score >= AUTO_NOTIFY_THRESHOLD) {
          await notifService.send({
            recipient: report.student,
            type: 'match',
            title: 'Potential match found!',
            body:  `We found a ${Math.round(score * 100)}% match for your ${report.itemName}. Verify ownership now.`,
            meta:  { matchId: match._id },
          });
        }
      }
    }
  }
}

module.exports = { triggerMatchForLost, triggerMatchForFound, getSimilarity };
