# AI Mock Interview Backend

A comprehensive backend API for the AI Mock Interview System with NLP-based answer evaluation, user authentication, and interview session management.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Question Management**: CRUD operations for interview questions across multiple domains (HR, Technical, Behavioral, Coding)
- **Interview Sessions**: Create, manage, and track interview sessions
- **AI Evaluation**: NLP-based answer evaluation using Natural, Compromise, and Sentiment analysis
- **Scoring System**: Evaluate answers on relevance, clarity, completeness, and confidence
- **Results & Analytics**: Detailed feedback, strengths, improvements, and sentiment analysis

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Natural** - NLP library
- **Compromise** - Text processing
- **Sentiment** - Sentiment analysis
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-mock-interview
JWT_SECRET=your-secure-secret-key
CORS_ORIGIN=http://localhost:8000
```

5. Seed the database with sample questions:
```bash
node seedDatabase.js
```

6. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Questions (`/api/questions`)

- `GET /api/questions` - Get all questions (supports filtering)
  - Query params: `domain`, `difficulty`, `limit`, `random`
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create new question
- `POST /api/questions/bulk` - Bulk create questions
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Interviews (`/api/interviews`)

- `POST /api/interviews/start` - Start new interview session (requires auth)
- `POST /api/interviews/:sessionId/answer` - Submit answer (requires auth)
- `POST /api/interviews/:sessionId/complete` - Complete interview (requires auth)
- `GET /api/interviews/:sessionId` - Get interview details (requires auth)
- `GET /api/interviews` - Get all user interviews (requires auth)
- `DELETE /api/interviews/:sessionId` - Delete interview (requires auth)

### Evaluation (`/api/evaluation`)

- `POST /api/evaluation/evaluate` - Evaluate single answer
- `POST /api/evaluation/evaluate-batch` - Batch evaluate multiple answers

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Questions
```bash
# Get all HR questions
curl http://localhost:5000/api/questions?domain=HR

# Get 5 random medium difficulty questions
curl http://localhost:5000/api/questions?difficulty=Medium&limit=5&random=true
```

### Start Interview
```bash
curl -X POST http://localhost:5000/api/interviews/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "domain": "Technical",
    "difficulty": "Medium"
  }'
```

### Submit Answer
```bash
curl -X POST http://localhost:5000/api/interviews/SESSION_ID/answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "questionId": "QUESTION_ID",
    "question": "What is closure?",
    "answer": "A closure is a function that has access to variables...",
    "keywords": ["function", "scope", "variable"],
    "timeSpent": 120
  }'
```

### Evaluate Answer
```bash
curl -X POST http://localhost:5000/api/evaluation/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "A closure is a function that retains access to variables from its outer scope even after the outer function has returned.",
    "keywords": ["function", "scope", "variable", "access"]
  }'
```

## NLP Evaluation Metrics

The system evaluates answers based on four key metrics:

1. **Relevance (0-100)**: Measures keyword matching and topic relevance
2. **Clarity (0-100)**: Evaluates sentence structure, coherence, and filler words
3. **Completeness (0-100)**: Assesses answer depth and detail
4. **Confidence (0-100)**: Analyzes linguistic features indicating confidence

## Database Models

### User
- username, email, password (hashed)
- profile (avatar, bio, skills, experience, education)
- statistics (totalInterviews, averageScore, totalTimeSpent)

### Question
- id, domain, question, ideal_answer
- keywords, difficulty, category, tags
- timeLimit

### Interview
- userId, sessionId, domain, difficulty, status
- answers (array with scores, feedback, sentiment)
- overallScore, emotionAnalysis
- strengths, improvements
- timestamps

## Project Structure

```
backend/
├── models/
│   ├── User.js
│   ├── Question.js
│   └── Interview.js
├── routes/
│   ├── auth.js
│   ├── questions.js
│   ├── interviews.js
│   └── evaluation.js
├── services/
│   └── nlpService.js
├── middleware/
│   └── auth.js
├── server.js
├── seedDatabase.js
├── package.json
└── .env.example
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT token authentication
- Password hashing with bcrypt
- Input validation

## Development

### Run in development mode:
```bash
npm run dev
```

### Seed database:
```bash
node seedDatabase.js
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `CORS_ORIGIN` - Allowed CORS origin
- `OPENAI_API_KEY` - OpenAI API key (optional, for advanced features)

## Future Enhancements

- OpenAI integration for advanced evaluation
- Video/audio recording storage
- Facial emotion recognition
- Real-time interview feedback
- Interview scheduling
- Admin dashboard
- Analytics and reporting

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
