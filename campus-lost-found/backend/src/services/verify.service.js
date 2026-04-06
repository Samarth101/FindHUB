const axios = require('axios');
const { mlServiceUrl } = require('../config/env');

/**
 * Generate verification questions from a found item's secretClues using AI.
 */
async function generateQuestions(category, secretClues) {
  try {
    const payload = {
      category: category || 'item',
      clues: secretClues.map(c => c.text),
    };

    const { data } = await axios.post(`${mlServiceUrl}/generate_questions`, payload);
    
    return (data.questions || []).map((q, i) => ({
      id: `q${i + 1}`,
      text: q,
    }));
  } catch (err) {
    console.warn('[ML] Question generation failed, using fallback:', err.message);
    return secretClues.slice(0, 3).map((clue, i) => ({
      id: `q${i + 1}`,
      text: `Please describe the ${clue.text.split(' ')[0]} of the item.`,
    }));
  }
}

/**
 * Grade student answers against the found item's secretClues using AI.
 */
async function gradeAnswers(category, answers, secretClues) {
  try {
    const payload = {
      category: category || 'item',
      secret_clues: secretClues.map(c => c.text),
      claimant_answers: answers.map(a => a.answer),
    };

    const { data } = await axios.post(`${mlServiceUrl}/evaluate_answers`, payload);
    
    // Convert new AI format to existing backend structure
    const status = data.passed ? 'approved' : 'rejected';
    const verifyScore = data.passed ? 0.95 : 0.10; // Mock score for schema compatibility

    return { 
      verifyScore, 
      scoredAnswers: answers.map(a => ({ ...a, score: data.passed ? 0.9 : 0.1 })),
      status,
      aiReason: data.reason
    };
  } catch (err) {
    console.error('[ML] Answer evaluation failed:', err.message);
    return { 
      verifyScore: 0, 
      scoredAnswers: answers, 
      status: 'review', 
      aiReason: 'AI evaluation failed, manual review required.' 
    };
  }
}

module.exports = { generateQuestions, gradeAnswers };
