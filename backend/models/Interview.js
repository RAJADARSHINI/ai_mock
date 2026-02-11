import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  question: String,
  answer: {
    type: String,
    required: true
  },
  transcriptText: String,
  wordCount: Number,
  timeSpent: Number, // seconds
  scores: {
    relevance: { type: Number, min: 0, max: 100 },
    clarity: { type: Number, min: 0, max: 100 },
    completeness: { type: Number, min: 0, max: 100 },
    confidence: { type: Number, min: 0, max: 100 },
    overall: { type: Number, min: 0, max: 100 }
  },
  keywordMatches: [{
    keyword: String,
    found: Boolean
  }],
  sentimentAnalysis: {
    score: Number,
    comparative: Number,
    positive: [String],
    negative: [String]
  },
  feedback: {
    type: String
  },
  aiSuggestions: [String]
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    unique: true,
    required: true
  },
  domain: {
    type: String,
    enum: ['HR', 'Technical', 'Behavioral', 'Coding'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  answers: [answerSchema],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  emotionAnalysis: {
    neutral: Number,
    happy: Number,
    sad: Number,
    angry: Number,
    surprised: Number
  },
  strengths: [String],
  improvements: [String],
  totalDuration: Number, // seconds
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ status: 1 });

export default mongoose.model('Interview', interviewSchema);
