import express from 'express';
import Question from '../models/Question.js';

const router = express.Router();

// Get all questions or filter by domain/difficulty
router.get('/', async (req, res) => {
  try {
    const { domain, difficulty, limit, random } = req.query;
    
    let query = {};
    
    if (domain) {
      query.domain = domain;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    let questions = await Question.find(query).select('-__v');
    
    // Randomize if requested
    if (random === 'true') {
      questions = questions.sort(() => Math.random() - 0.5);
    }
    
    // Limit results
    if (limit) {
      questions = questions.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findOne({ id: req.params.id });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new question (Admin)
router.post('/', async (req, res) => {
  try {
    const question = await Question.create(req.body);
    
    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk create questions
router.post('/bulk', async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: 'Questions must be an array'
      });
    }
    
    const created = await Question.insertMany(questions);
    
    res.status(201).json({
      success: true,
      count: created.length,
      data: created
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update question
router.put('/:id', async (req, res) => {
  try {
    const question = await Question.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete question
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ id: req.params.id });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
