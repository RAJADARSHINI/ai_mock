# 🚀 Python Backend - AI Mock Interview

## ⚠️ CRITICAL: Camera & Microphone Access

**DO NOT use VS Code Simple Browser!** It blocks camera/microphone access.

✅ **Always use Chrome, Edge, or Firefox (external browser)**

---

## 🎯 Quick Start

### Starting the Backend

**Option 1: Double-click**
```
START_PYTHON_BACKEND.bat (in project root)
```

**Option 2: Terminal**
```powershell
cd python_backend
python app.py
```

**Option 3: PowerShell Script**
```powershell
cd python_backend
.\start_backend.ps1
```

### What You'll See

```
======================================================================
🚀 AI MOCK INTERVIEW - PYTHON BACKEND
======================================================================

✓ Vectorizer loaded successfully
✓ Model loaded successfully

✓ Backend ready!

======================================================================
📡 BACKEND URL:  http://localhost:5000
📡 API ENDPOINT: http://localhost:5000/evaluate-answer
======================================================================

⚠️  IMPORTANT: OPEN IN EXTERNAL BROWSER (Chrome/Edge/Firefox)
   DO NOT use VS Code Simple Browser - it blocks camera/microphone!

   1. Keep this terminal running
   2. Open your frontend in Chrome/Edge: http://localhost:8000
   3. Grant camera/microphone permissions when prompted

======================================================================
Press Ctrl+C to stop the server
```

---

## ✅ CORS Configuration (Already Configured!)

The backend is now properly configured with CORS to allow your frontend (opened in Chrome/Edge) to communicate with the backend:

- ✅ **Origin:** Accepts requests from ANY origin (`*`)
- ✅ **Methods:** GET, POST, OPTIONS
- ✅ **Headers:** Content-Type, Authorization
- ✅ **Credentials:** Disabled for local development

**No CORS errors when using external browser!**

---

## 📡 API Endpoint

### POST /evaluate-answer

**Request:**
```json
{
  "question": "Tell me about yourself",
  "user_answer": "I am a software developer with 5 years of experience..."
}
```

**Response:**
```json
{
  "score": 85,
  "feedback": "Excellent answer! You demonstrated strong knowledge...",
  "strengths": [
    "Clear communication",
    "Relevant experience"
  ],
  "improvements": [
    "Add more specific examples"
  ]
}
```

### Frontend Integration

```javascript
async function evaluateAnswer(question, userAnswer) {
  const response = await fetch('http://localhost:5000/evaluate-answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: question,
      user_answer: userAnswer
    })
  });
  
  const result = await response.json();
  return result;
}
```

---

## 🔧 Setup (First Time Only)

1. **Install Python** (3.8 or higher)
   - Download from: https://www.python.org/

2. **Install Dependencies**
   ```powershell
   cd python_backend
   pip install -r requirements.txt
   ```

3. **Place Model Files** (if needed)
   ```
   python_backend/
   ├── models/
   │   ├── model.pkl          # Your trained ML model
   │   └── vectorizer.pkl     # Your text vectorizer
   ```

---

## 📝 Important Changes Made

### What Was Changed:

1. ✅ **CORS enabled** for all origins (allows Chrome/Edge to access backend)
2. ✅ **Debug mode disabled** (prevents Flask auto-opening browsers)
3. ✅ **Clear terminal output** with backend URL prominently displayed
4. ✅ **No auto-reload** (prevents connection interruptions)

### Why These Changes:

- **CORS:** Your frontend (in Chrome) needs to make API calls to the backend
- **No debug mode:** Debug mode can trigger Flask to open browsers automatically
- **Clear output:** You need to see the URL to know the backend is ready
- **No reload:** Auto-reloading can disconnect your frontend mid-interview

---

## 🛑 Stopping the Backend

Press `Ctrl+C` in the terminal to stop the Flask server.

---

## 🆘 Troubleshooting

### Issue: "CORS error" in browser console
**Solution:** Backend must be running. Check terminal shows "Backend ready"

### Issue: "Connection refused"
**Solution:** 
- Backend not started yet
- Check port 5000 is not used by another app
- Restart the backend

### Issue: "Camera/microphone blocked"
**Solution:** You're using VS Code Simple Browser. Close it and use Chrome/Edge.

### Issue: "Model files not found"
**Solution:** Place `model.pkl` and `vectorizer.pkl` in the `models/` folder

---

## 📚 Health Check Endpoints

**GET /** - Main health check
```json
{
  "status": "running",
  "model_loaded": true,
  "vectorizer_loaded": true
}
```

**GET /health** - Alternative health check
```json
{
  "status": "healthy",
  "model_loaded": true,
  "vectorizer_loaded": true
}
```

---

## 🎯 Complete Workflow

1. **Start backend** → See "Backend URL: http://localhost:5000" in terminal
2. **Start frontend server** (if needed) → `python -m http.server 8000`
3. **Open Chrome/Edge** (external browser)
4. **Navigate to** → http://localhost:8000
5. **Grant permissions** → Allow camera/microphone when prompted
6. **Use app** → Camera works, backend evaluates answers! ✨

---

**Remember:** Backend runs in terminal, frontend opens in external browser!
