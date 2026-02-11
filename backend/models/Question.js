import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  domain: {
    type: String,
    required: true,
    enum: ['HR', 'Technical', 'Behavioral', 'Coding'],
    index: true
  },
  question: {
    type: String,
    required: true
  },
  ideal_answer: {
    type: String
  },
  keywords: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  category: {
    type: String
  },
  tags: [{
    type: String
  }],
  timeLimit: {
    type: Number,
    default: 120 // seconds
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

questionSchema.index({ domain: 1, difficulty: 1 });

export default mongoose.model('Question', questionSchema);
