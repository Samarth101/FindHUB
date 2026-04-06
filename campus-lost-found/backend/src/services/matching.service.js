const axios = require('axios')
const LostReport = require('../models/LostReport')
const FoundItem = require('../models/FoundItem')
const Match = require('../models/Match')
const notifService = require('./notification.service')
const { mlServiceUrl } = require('../config/env')

const MATCH_THRESHOLD = 0.60
const AUTO_NOTIFY_THRESHOLD = 0.80

async function getSimilarity(textA, textB) {
  try {
    const { data } = await axios.post(`${mlServiceUrl}/similarity`, { textA, textB }, { timeout: 10000 })
    return data.score || 0
  } catch {
    const setA = new Set(textA.toLowerCase().split(/\s+/))
    const setB = new Set(textB.toLowerCase().split(/\s+/))
    const intersection = [...setA].filter(w => setB.has(w)).length
    return intersection / (setA.size + setB.size - intersection)
  }
}

function lostReportText(report) {
  return [
    report.category, report.itemName, report.brand,
    report.color, report.description, report.distinguishingFeatures,
    report.location
  ].filter(Boolean).join(' ')
}

function foundItemText(item) {
  return [
    item.category, item.itemName, item.brand,
    item.color, item.description, item.location
  ].filter(Boolean).join(' ')
}

/**
 * Trigger matching when a NEW LOST REPORT is filed.
 * Scans all available found items using the AI Match Engine.
 */
async function triggerMatchForLost(lostReportId) {
  const report = await LostReport.findById(lostReportId)
  if (!report) return

  const foundItems = await FoundItem.find({ status: 'unmatched', isDeleted: false });
  if (foundItems.length === 0) return 0;

  // Prepare input for AI Match Engine
  const payload = {
    found_item: null, // We'll swap this in the loop logic below or just call AI for each pair
    lost_items: [{
      lost_item_id: report._id.toString(),
      description: report.description,
      category: report.category,
      color: report.color,
      brand: report.brand,
      latitude: report.locationCoords?.lat,
      longitude: report.locationCoords?.lng,
    }]
  };

  let matchCount = 0;

  for (const item of foundItems) {
    try {
      const response = await axios.post(`${mlServiceUrl}/match_items`, {
        found_item: {
          found_item_id: item._id.toString(),
          description: item.description,
          category: item.category,
          color: item.color,
          brand: item.brand,
          latitude: item.locationCoords?.lat,
          longitude: item.locationCoords?.lng,
        },
        lost_items: payload.lost_items
      });

      const aiMatch = response.data.matches?.[0];
      if (aiMatch && aiMatch.match_score >= MATCH_THRESHOLD) {
        const score = aiMatch.match_score;
        const existing = await Match.findOne({ lostReport: report._id, foundItem: item._id });
        if (!existing) {
          const match = await Match.create({
            lostReport: report._id,
            foundItem:  item._id,
            score,
            status: 'pending_verify',
          });
          matchCount++;

          item.status = 'matched';
          await item.save();

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
    } catch (err) {
      console.error('[ML] Match error for item:', item._id, err.message);
    }
  }

  if (matchCount > 0) {
    report.status = 'matched';
    await report.save();
  }

  return matchCount;
}

/**
 * Trigger matching when a NEW FOUND ITEM is added.
 */
async function triggerMatchForFound(foundItemId) {
  const item = await FoundItem.findById(foundItemId)
  if (!item) return

  const searchingReports = await LostReport.find({ status: 'searching', isDeleted: false });
  if (searchingReports.length === 0) return;

  try {
    const payload = {
      found_item: {
        found_item_id: item._id.toString(),
        description: item.description,
        category: item.category,
        color: item.color,
        brand: item.brand,
        latitude: item.locationCoords?.lat,
        longitude: item.locationCoords?.lng,
      },
      lost_items: searchingReports.map(r => ({
        lost_item_id: r._id.toString(),
        description: r.description,
        category: r.category,
        color: r.color,
        brand: r.brand,
        latitude: r.locationCoords?.lat,
        longitude: r.locationCoords?.lng,
      }))
    };

    const { data } = await axios.post(`${mlServiceUrl}/match_items`, payload);
    
    for (const aiMatch of data.matches || []) {
      if (aiMatch.match_score >= MATCH_THRESHOLD) {
        const report = searchingReports.find(r => r._id.toString() === aiMatch.lost_item_id);
        if (!report) continue;

        const existing = await Match.findOne({ lostReport: report._id, foundItem: item._id });
        if (!existing) {
          const match = await Match.create({
            lostReport: report._id,
            foundItem:  item._id,
            score: aiMatch.match_score,
            status: 'pending_verify',
          });

          report.status = 'matched';
          await report.save();

          item.status = 'matched';
          await item.save();

          if (aiMatch.match_score >= AUTO_NOTIFY_THRESHOLD) {
            await notifService.send({
              recipient: report.student,
              type: 'match',
              title: 'Potential match found!',
              body:  `We found a ${Math.round(aiMatch.match_score * 100)}% match for your ${report.itemName}. Verify ownership now.`,
              meta:  { matchId: match._id },
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('[ML] Batch match error:', err.message);
  }
}

module.exports = { triggerMatchForLost, triggerMatchForFound };
