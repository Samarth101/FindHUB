const { getSimilarity } = require('./matching.service');

// Thresholds for auto-decisions
const PASS_THRESHOLD   = 0.75;  // avg score >= 0.75 → approved
const REVIEW_THRESHOLD = 0.45;  // avg score 0.45–0.75 → manual review
                                 // below 0.45 → rejected

/**
 * Generate verification questions from a found item's secretClues.
 * In production, the ML service would paraphrase these.
 * Here we use the clues directly with generic wrappers.
 */
function generateQuestions(secretClues) {
  const templates = [
    (clue) => ({ id: `q_${Date.now()}_1`, text: clue.text }),
    (clue) => ({ id: `q_${Date.now()}_2`, text: `Can you describe: "${clue.text.substring(0, 30)}..."?` }),
  ];

  return secretClues.slice(0, 4).map((clue, i) => ({
    id: `q${i + 1}`,
    text: clue.text,
  }));
}

/**
 * Grade student answers against the found item's secretClues.
 * Returns scored answers, aggregate score, and an auto-decision.
 *
 * @param {Array} answers   — [{ questionId, question, answer }]
 * @param {Array} secretClues — from FoundItem.secretClues
 */
async function gradeAnswers(answers, secretClues) {
  const scoredAnswers = [];

  for (let i = 0; i < answers.length; i++) {
    const { questionId, question, answer } = answers[i];
    
    // Find the best similarity score for this answer against ANY of the secret clues
    let bestScoreForThisAnswer = 0;
    
    if (answer.trim()) {
      for (const clue of secretClues) {
        const score = await getSimilarity(answer, clue.text);
        if (score > bestScoreForThisAnswer) {
          bestScoreForThisAnswer = score;
        }
      }
    }

    scoredAnswers.push({ questionId, question, answer, score: bestScoreForThisAnswer });
  }

  const avgScore = scoredAnswers.length > 0
    ? scoredAnswers.reduce((sum, a) => sum + a.score, 0) / scoredAnswers.length
    : 0;

  let status;
  if (avgScore >= PASS_THRESHOLD)        status = 'approved';
  else if (avgScore >= REVIEW_THRESHOLD) status = 'review';
  else                                   status = 'rejected';

  return { verifyScore: avgScore, scoredAnswers, status };
}

module.exports = { generateQuestions, gradeAnswers };
