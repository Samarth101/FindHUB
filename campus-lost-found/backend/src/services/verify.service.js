const axios = require('axios');
const { mlServiceUrl } = require('../config/env');

const PASS_THRESHOLD   = 0.75;
const REVIEW_THRESHOLD = 0.45;

/**
 * Generate verification questions from a found item's secretClues.
 */
async function generateQuestions(secretClues) {
  try {
    const cluesText = secretClues.map(c => c.text);
    const { data } = await axios.post(`${mlServiceUrl}/generate_questions`, {
      category: 'item',
      clues: cluesText
    });
    
    return data.questions.map((q, i) => ({
      id: `q${i + 1}`,
      text: q
    }));
  } catch (err) {
    console.log('ML /generate_questions error:', err.message);
    return secretClues.slice(0, 4).map((clue, i) => ({
      id: `q${i + 1}`,
      text: clue.text,
    }));
  }
}

/**
 * Grade student answers against the found item's secretClues.
 * Sends both questions asked and answers given for accurate comparison.
 */
async function gradeAnswers(answers, secretClues) {
  const cluesText = secretClues.map(c => c.text);
  
  // Build Q&A pairs so the AI can see the full context
  const qa_pairs = answers.map(a => ({
    question: a.question || '',
    answer: a.answer || ''
  }));
  
  try {
    const { data } = await axios.post(`${mlServiceUrl}/evaluate_answers`, {
      category: 'item',
      secret_clues: cluesText,
      claimant_answers: answers.map(a => a.answer),
      qa_pairs: qa_pairs
    });
    
    // Returns { passed: true/false, reason: "..." }
    let status = data.passed ? 'approved' : 'rejected';
    
    const scoredAnswers = answers.map(a => ({
        ...a,
        score: data.passed ? 1.0 : 0.0
    }));

    return { 
       verifyScore: data.passed ? 1.0 : 0.0, 
       scoredAnswers, 
       status,
       reason: data.reason 
    };

  } catch (err) {
     console.log('ML /evaluate_answers error:', err.message);
     return { verifyScore: 0, scoredAnswers: [], status: 'review' };
  }
}

module.exports = { generateQuestions, gradeAnswers };
