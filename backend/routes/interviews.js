import express from 'express';
import Interview from '../models/Interview.js';
import { protect } from '../middleware/auth.js';
import { evaluateAnswer } from '../services/nlpService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory storage for demo mode (when MongoDB is not available)
const demoInterviews = new Map();

/**
 * Create new interview session
 */
router.post('/start', protect, async (req, res) => {
  try {
    const { domain, difficulty } = req.body;
    
    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }
    
    let interview;
    try {
      interview = await Interview.create({
        userId: req.user._id,
        sessionId: uuidv4(),
        domain,
        difficulty: difficulty || 'Medium',
        status: 'in-progress'
      });
    } catch (error) {
      // Fallback to in-memory storage if MongoDB is not available
      const sessionId = uuidv4();
      interview = {
        userId: req.user?._id || 'demo-user',
        sessionId,
        domain,
        difficulty: difficulty || 'Medium',
        status: 'in-progress',
        answers: [],
        startedAt: new Date()
      };
      demoInterviews.set(sessionId, interview);
    }
    
    res.status(201).json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Submit answer for a question
 */
router.post('/:sessionId/answer', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, question, answer, keywords, timeSpent } = req.body;
    
    if (!answer) {
      return res.status(400).json({
        success: false,
        error: 'Answer is required'
      });
    }
    
    // Find interview
    const interview = await Interview.findOne({ sessionId, userId: req.user._id });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }
    
    if (interview.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        error: 'Interview session is not active'
      });
    }
    
    // Evaluate answer
    const evaluation = evaluateAnswer(answer, keywords || [], 100);
    
    // Add answer to interview
    interview.answers.push({
      questionId,
      question,
      answer,
      transcriptText: answer,
      wordCount: evaluation.wordCount,
      timeSpent,
      scores: evaluation.scores,
      keywordMatches: evaluation.keywordMatches,
      sentimentAnalysis: evaluation.sentimentAnalysis,
      feedback: evaluation.feedback,
      aiSuggestions: evaluation.strengths
    });
    
    await interview.save();
    
    res.json({
      success: true,
      data: {
        evaluation,
        answerCount: interview.answers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Complete interview and generate final report
 */
router.post('/:sessionId/complete', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { totalDuration } = req.body;
    
    const interview = await Interview.findOne({ sessionId, userId: req.user._id });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }
    
    if (interview.answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No answers submitted'
      });
    }
    
    // Calculate overall score
    const overallScore = Math.round(
      interview.answers.reduce((sum, ans) => sum + ans.scores.overall, 0) / interview.answers.length
    );
    
    // Collect strengths and improvements
    const allStrengths = [];
    const allImprovements = [];
    
    interview.answers.forEach(ans => {
      if (ans.scores.relevance >= 70) allStrengths.push('Strong relevance to questions');
      if (ans.scores.clarity >= 70) allStrengths.push('Clear communication');
      if (ans.scores.completeness >= 70) allStrengths.push('Comprehensive answers');
      if (ans.scores.confidence >= 70) allStrengths.push('Confident delivery');
      
      if (ans.scores.relevance < 60) allImprovements.push('Focus more on key concepts');
      if (ans.scores.clarity < 60) allImprovements.push('Improve sentence structure');
      if (ans.scores.completeness < 60) allImprovements.push('Provide more detail');
      if (ans.scores.confidence < 60) allImprovements.push('Use more assertive language');
    });
    
    // Remove duplicates and limit
    const strengths = [...new Set(allStrengths)].slice(0, 5);
    const improvements = [...new Set(allImprovements)].slice(0, 5);
    
    // Mock emotion analysis (in production, use facial recognition API)
    const emotionAnalysis = {
      neutral: 40 + Math.random() * 20,
      happy: 20 + Math.random() * 15,
      sad: Math.random() * 5,
      angry: Math.random() * 3,
      surprised: 10 + Math.random() * 15
    };
    
    // Update interview
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.overallScore = overallScore;
    interview.strengths = strengths;
    interview.improvements = improvements;
    interview.emotionAnalysis = emotionAnalysis;
    interview.totalDuration = totalDuration;
    
    await interview.save();
    
    // Update user statistics
    req.user.statistics.totalInterviews += 1;
    req.user.statistics.averageScore = Math.round(
      (req.user.statistics.averageScore * (req.user.statistics.totalInterviews - 1) + overallScore) / 
      req.user.statistics.totalInterviews
    );
    req.user.statistics.totalTimeSpent += totalDuration || 0;
    await req.user.save();
    
    res.json({
      success: true,
      data: {
        sessionId: interview.sessionId,
        overallScore,
        strengths,
        improvements,
        emotionAnalysis,
        answerCount: interview.answers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get interview details
 */
router.get('/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const interview = await Interview.findOne({ sessionId, userId: req.user._id });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }
    
    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all interviews for current user
 */
router.get('/', protect, async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    const query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const interviews = await Interview.find(query)
      .sort({ startedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-answers');
    
    const total = await Interview.countDocuments(query);
    
    res.json({
      success: true,
      count: interviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete interview
 */
router.delete('/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const interview = await Interview.findOneAndDelete({ 
      sessionId, 
      userId: req.user._id 
    });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
