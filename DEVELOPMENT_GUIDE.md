# AI Mock Interview - Professional Development Guide

## 🚀 Quick Start (Professional Way)

### One-Command Startup:
```powershell
.\start.ps1
```

This will automatically:
- ✅ Check MongoDB status
- ✅ Start backend server (Port 5000)
- ✅ Start frontend server (Port 8000)
- ✅ Open browser

### Stop All Servers:
```powershell
.\stop.ps1
```

---

## 📂 Project Structure

```
ai mock/
├── backend/                 # Node.js Backend
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic (NLP)
│   ├── middleware/         # Auth middleware
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   └── .env                # Configuration
│
├── frontend/               # HTML/JS/CSS Frontend
│   ├── index.html          # Landing page
│   ├── login.html          # Login page
│   ├── interview.html      # Interview interface
│   ├── feedback.html       # Results page
│   ├── scripts/            # JavaScript modules
│   └── styles/             # CSS files
│
├── start.ps1               # Start all servers
└── stop.ps1                # Stop all servers
```

---

## 🔧 Manual Professional Setup

### Terminal 1 - MongoDB:
```powershell
# Install MongoDB from: https://www.mongodb.com/try/download/community
# Then start service:
net start MongoDB

# OR run manually:
mongod --dbpath "C:\data\db"
```

### Terminal 2 - Backend:
```powershell
cd "c:\Users\akshi\Downloads\ai mock\backend"
npm install                    # First time only
node seedDatabase.js           # First time only
npm run dev                    # Start server
```

### Terminal 3 - Frontend:
```powershell
cd "c:\Users\akshi\Downloads\ai mock"
python -m http.server 8000     # Start server
```

### Browser:
Open: `http://localhost:8000`

---

## 🌐 How Frontend & Backend Connect

### API Endpoints Used by Frontend:

```javascript
// In your frontend JavaScript:

// 1. Register User
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username, email, password})
})

// 2. Login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email, password})
})

// 3. Get Questions
fetch('http://localhost:5000/api/questions?domain=Technical')

// 4. Start Interview
fetch('http://localhost:5000/api/interviews/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({domain: 'HR', difficulty: 'Medium'})
})

// 5. Submit Answer
fetch(`http://localhost:5000/api/interviews/${sessionId}/answer`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({questionId, answer, keywords})
})

// 6. Evaluate Answer
fetch('http://localhost:5000/api/evaluation/evaluate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({answer, keywords})
})
```

---

## 📊 Development Workflow

### 1. Development Mode:
```powershell
# Backend with auto-reload
cd backend
npm run dev

# Frontend (no changes needed, just refresh browser)
```

### 2. Testing APIs:
Use tools like:
- **Postman** - GUI for API testing
- **Thunder Client** - VS Code extension
- **curl** - Command line

Example:
```powershell
curl http://localhost:5000/api/questions
```

### 3. Viewing Logs:
- **Backend logs**: Check Terminal 2
- **Frontend logs**: Open browser DevTools (F12)
- **MongoDB logs**: Check MongoDB window

---

## 🎯 Production Deployment

### Option 1: Traditional Hosting
- **Frontend**: Deploy to Netlify, Vercel, or GitHub Pages
- **Backend**: Deploy to Heroku, Railway, or DigitalOcean
- **Database**: MongoDB Atlas (cloud)

### Option 2: Docker
```dockerfile
# Coming soon - Dockerfile for containerization
```

---

## 🛠️ Troubleshooting

### Port Already in Use:
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### MongoDB Connection Error:
- Install MongoDB Community Edition
- Start MongoDB service
- Check if port 27017 is available

### CORS Errors:
- Make sure backend CORS_ORIGIN in .env matches frontend URL
- Default: `http://localhost:8000`

---

## 📱 Features Breakdown

### Without Backend (Frontend Only):
✅ Landing page
✅ Interview interface
✅ Camera & microphone
✅ Speech-to-text
✅ Basic scoring
✅ Local storage

### With Backend (Full Stack):
✅ All frontend features
✅ User authentication
✅ Advanced AI evaluation (NLP)
✅ Interview history
✅ Analytics dashboard
✅ Database persistence
✅ Sentiment analysis

---

## 🔐 Security Notes

- Never commit `.env` file
- Change `JWT_SECRET` in production
- Use HTTPS in production
- Implement rate limiting (already included)
- Sanitize user inputs

---

## 📚 Learn More

- Express.js: https://expressjs.com
- MongoDB: https://docs.mongodb.com
- Natural NLP: https://github.com/NaturalNode/natural
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
