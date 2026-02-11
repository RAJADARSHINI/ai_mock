import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import interviewRoutes from './routes/interviews.js';
import evaluationRoutes from './routes/evaluation.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// MIDDLEWARE
// ========================================

// Security
app.use(helmet());

// ========================================
// CORS CONFIGURATION FOR EXTERNAL BROWSER
// ========================================
// Allow all origins for local development
// This enables your frontend (opened in Chrome/Edge) to communicate with the backend
app.use(cors({
  origin: '*', // Allow all origins for local development
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ========================================
// DATABASE CONNECTION
// ========================================

const connectDB = async () => {
  try {
    // MongoDB connection disabled for demo mode
    console.log('⚠️  Running in demo mode without MongoDB');
    console.log('   Database operations will be skipped');
    // Uncomment below to enable MongoDB:
    // const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-mock-interview');
    // console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// ========================================
// ROUTES
// ========================================

app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Mock Interview API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      questions: '/api/questions',
      interviews: '/api/interviews',
      evaluation: '/api/evaluation'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/evaluation', evaluationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log('='.repeat(70));
    console.log('🚀 AI MOCK INTERVIEW - NODE BACKEND');
    console.log('='.repeat(70));
    console.log(`\n📡 BACKEND URL:  http://localhost:${PORT}`);
    console.log(`📡 API ENDPOINT: http://localhost:${PORT}/api/`);
    console.log('='.repeat(70));
    console.log('\n⚠️  IMPORTANT: OPEN IN EXTERNAL BROWSER (Chrome/Edge/Firefox)');
    console.log('   DO NOT use VS Code Simple Browser - it blocks camera/microphone!\n');
    console.log('   1. Keep this terminal running');
    console.log('   2. Open your frontend in Chrome/Edge: http://localhost:8000');
    console.log('   3. Grant camera/microphone permissions when prompted\n');
    console.log('='.repeat(70));
    console.log('Press Ctrl+C to stop the server\n');
  });
};

startServer();
