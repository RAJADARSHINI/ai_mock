import express from 'express';
import { evaluateAnswer } from '../services/nlpService.js';

const router = express.Router();

/**
 * Evaluate a single answer
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { answer, keywords, idealWordCount } = req.body;
    
    if (!answer) {
      return res.status(400).json({
        success: false,
        error: 'Answer text is required'
      });
    }
    
    const evaluation = evaluateAnswer(answer, keywords || [], idealWordCount || 100);
    
    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Batch evaluate multiple answers
 */
router.post('/evaluate-batch', async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers must be an array'
      });
    }
    
    const evaluations = answers.map(item => {
      return evaluateAnswer(
        item.answer,
        item.keywords || [],
        item.idealWordCount || 100
      );
    });
    
    // Calculate overall statistics
    const overallScore = Math.round(
      evaluations.reduce((sum, e) => sum + e.scores.overall, 0) / evaluations.length
    );
    
    const allStrengths = [...new Set(evaluations.flatMap(e => e.strengths))];
    const allImprovements = [...new Set(evaluations.flatMap(e => e.improvements))];
    
    res.json({
      success: true,
      data: {
        evaluations,
        summary: {
          overallScore,
          averageScores: {
            relevance: Math.round(evaluations.reduce((sum, e) => sum + e.scores.relevance, 0) / evaluations.length),
            clarity: Math.round(evaluations.reduce((sum, e) => sum + e.scores.clarity, 0) / evaluations.length),
            completeness: Math.round(evaluations.reduce((sum, e) => sum + e.scores.completeness, 0) / evaluations.length),
            confidence: Math.round(evaluations.reduce((sum, e) => sum + e.scores.confidence, 0) / evaluations.length)
          },
          strengths: allStrengths.slice(0, 5),
          improvements: allImprovements.slice(0, 5)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
