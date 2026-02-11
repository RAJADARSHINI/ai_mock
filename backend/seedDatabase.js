import Question from './models/Question.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Sample questions data
const questions = [
  {
    id: 1,
    domain: 'HR',
    question: 'Tell me about yourself and your background.',
    ideal_answer: 'Provide a brief overview of your education, professional experience, key skills, and career goals. Focus on relevant achievements and what makes you a good fit for the role.',
    keywords: ['background', 'experience', 'education', 'skills', 'career', 'goals'],
    difficulty: 'Easy'
  },
  {
    id: 2,
    domain: 'HR',
    question: 'Why do you want to work for our company?',
    ideal_answer: 'Express genuine interest in the company\'s mission, culture, and values. Mention specific aspects that align with your career goals and how you can contribute.',
    keywords: ['company', 'interest', 'motivation', 'culture', 'values', 'contribution'],
    difficulty: 'Easy'
  },
  {
    id: 3,
    domain: 'HR',
    question: 'What are your greatest strengths?',
    ideal_answer: 'Highlight 2-3 key strengths relevant to the position with specific examples demonstrating these qualities in action.',
    keywords: ['strength', 'skill', 'ability', 'expertise', 'competence'],
    difficulty: 'Easy'
  },
  {
    id: 4,
    domain: 'HR',
    question: 'What is your greatest weakness?',
    ideal_answer: 'Be honest about a genuine weakness while showing self-awareness and explaining steps you\'re taking to improve.',
    keywords: ['weakness', 'improve', 'challenge', 'development', 'growth'],
    difficulty: 'Medium'
  },
  {
    id: 5,
    domain: 'HR',
    question: 'Where do you see yourself in 5 years?',
    ideal_answer: 'Discuss your career aspirations and how this role fits into your long-term professional development.',
    keywords: ['goal', 'future', 'career', 'ambition', 'growth', 'development'],
    difficulty: 'Medium'
  },
  {
    id: 6,
    domain: 'Technical',
    question: 'Explain the concept of closures in JavaScript.',
    ideal_answer: 'A closure is a function that has access to variables in its outer (enclosing) function\'s scope, even after the outer function has returned.',
    keywords: ['function', 'scope', 'variable', 'access', 'enclosing'],
    difficulty: 'Medium'
  },
  {
    id: 7,
    domain: 'Technical',
    question: 'What is the difference between HTTP and HTTPS?',
    ideal_answer: 'HTTPS is HTTP with encryption. It uses SSL/TLS to encrypt data between client and server, providing security and data integrity.',
    keywords: ['encryption', 'security', 'SSL', 'TLS', 'secure', 'protocol'],
    difficulty: 'Easy'
  },
  {
    id: 8,
    domain: 'Technical',
    question: 'Explain RESTful API design principles.',
    ideal_answer: 'REST principles include stateless communication, resource-based URLs, standard HTTP methods, and proper status codes.',
    keywords: ['REST', 'stateless', 'HTTP', 'resource', 'API', 'endpoint'],
    difficulty: 'Medium'
  },
  {
    id: 9,
    domain: 'Technical',
    question: 'What is the difference between SQL and NoSQL databases?',
    ideal_answer: 'SQL databases are relational with structured schemas, while NoSQL databases are non-relational and offer flexible schemas for unstructured data.',
    keywords: ['database', 'relational', 'schema', 'structured', 'flexible', 'NoSQL'],
    difficulty: 'Medium'
  },
  {
    id: 10,
    domain: 'Technical',
    question: 'Explain the concept of promises in JavaScript.',
    ideal_answer: 'Promises represent asynchronous operations that may complete in the future. They have three states: pending, fulfilled, or rejected.',
    keywords: ['asynchronous', 'async', 'await', 'then', 'catch', 'resolve', 'reject'],
    difficulty: 'Medium'
  },
  {
    id: 11,
    domain: 'Behavioral',
    question: 'Describe a time when you had to meet a tight deadline.',
    ideal_answer: 'Use the STAR method: Situation, Task, Action, Result. Explain the context, your approach, and the outcome.',
    keywords: ['deadline', 'pressure', 'time management', 'priority', 'result'],
    difficulty: 'Medium'
  },
  {
    id: 12,
    domain: 'Behavioral',
    question: 'Tell me about a conflict you had with a coworker and how you resolved it.',
    ideal_answer: 'Describe the situation, your approach to resolution, and the positive outcome. Emphasize communication and compromise.',
    keywords: ['conflict', 'resolution', 'communication', 'teamwork', 'compromise'],
    difficulty: 'Hard'
  },
  {
    id: 13,
    domain: 'Behavioral',
    question: 'Describe a time when you showed leadership.',
    ideal_answer: 'Explain a situation where you took initiative, motivated others, and achieved a positive outcome.',
    keywords: ['leadership', 'initiative', 'team', 'motivation', 'guidance'],
    difficulty: 'Medium'
  },
  {
    id: 14,
    domain: 'Behavioral',
    question: 'Tell me about a time you failed and what you learned.',
    ideal_answer: 'Be honest about the failure, explain what you learned, and how you applied that learning to improve.',
    keywords: ['failure', 'learn', 'improvement', 'growth', 'reflection'],
    difficulty: 'Hard'
  },
  {
    id: 15,
    domain: 'Behavioral',
    question: 'How do you handle stress and pressure?',
    ideal_answer: 'Describe specific strategies like prioritization, time management, breaks, and maintaining perspective.',
    keywords: ['stress', 'pressure', 'manage', 'cope', 'strategy', 'balance'],
    difficulty: 'Medium'
  },
  {
    id: 16,
    domain: 'Coding',
    question: 'Write a function to reverse a string.',
    ideal_answer: 'You can use array methods: str.split("").reverse().join("") or a loop to iterate backwards.',
    keywords: ['string', 'reverse', 'array', 'loop', 'algorithm'],
    difficulty: 'Easy'
  },
  {
    id: 17,
    domain: 'Coding',
    question: 'Explain and implement a binary search algorithm.',
    ideal_answer: 'Binary search works on sorted arrays by repeatedly dividing the search interval in half. Time complexity is O(log n).',
    keywords: ['binary search', 'algorithm', 'sorted', 'divide', 'complexity'],
    difficulty: 'Medium'
  },
  {
    id: 18,
    domain: 'Coding',
    question: 'What are the differences between var, let, and const in JavaScript?',
    ideal_answer: 'var is function-scoped, let and const are block-scoped. const cannot be reassigned.',
    keywords: ['var', 'let', 'const', 'scope', 'variable', 'declaration'],
    difficulty: 'Easy'
  },
  {
    id: 19,
    domain: 'Coding',
    question: 'Explain time and space complexity with examples.',
    ideal_answer: 'Time complexity measures algorithm execution time, space complexity measures memory usage. Both use Big O notation.',
    keywords: ['complexity', 'Big O', 'time', 'space', 'algorithm', 'performance'],
    difficulty: 'Medium'
  },
  {
    id: 20,
    domain: 'Coding',
    question: 'How would you detect a cycle in a linked list?',
    ideal_answer: 'Use Floyd\'s cycle detection algorithm with two pointers (slow and fast). If they meet, there\'s a cycle.',
    keywords: ['linked list', 'cycle', 'algorithm', 'pointer', 'detection'],
    difficulty: 'Hard'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-mock-interview');
    console.log('Connected to MongoDB');
    
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    
    // Insert new questions
    await Question.insertMany(questions);
    console.log(`Inserted ${questions.length} questions`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
