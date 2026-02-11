# 🚀 Node Backend - AI Mock Interview

## ⚠️ CRITICAL: Camera & Microphone Access

**DO NOT use VS Code Simple Browser!** It blocks camera/microphone access.

✅ **Always use Chrome, Edge, or Firefox (external browser)**

---

## 🎯 Quick Start

### Starting the Backend

**Option 1: Double-click**
```
START_NODE_BACKEND.bat (in project root)
```

**Option 2: Terminal**
```powershell
cd backend
npm start
```

**Option 3: Development Mode (with auto-restart)**
```powershell
cd backend
npm run dev
```

### What You'll See

```
======================================================================
🚀 AI MOCK INTERVIEW - NODE BACKEND
======================================================================

⚠️  Running in demo mode without MongoDB

📡 BACKEND URL:  http://localhost:5000
📡 API ENDPOINT: http://localhost:5000/api/
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
- ✅ **Methods:** GET, POST, PUT, DELETE, OPTIONS
- ✅ **Headers:** Content-Type, Authorization
- ✅ **Credentials:** Disabled for local development

**No CORS errors when using external browser!**

---

## 📡 API Endpoints

### Main Routes
- `GET /` - API info and available endpoints
- `POST /api/auth` - Authentication
- `GET /api/questions` - Get interview questions
- `POST /api/interviews` - Start/manage interviews
- `POST /api/evaluation` - Evaluate answers

### Example Request

```javascript
// Fetch questions
const response = await fetch('http://localhost:5000/api/questions', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const questions = await response.json();
```

---

## 🔧 Setup (First Time Only)

1. **Install Node.js** (v16 or higher)
   - Download from: https://nodejs.org/

2. **Install Dependencies**
   ```powershell
   cd backend
   npm install
   ```

3. **Optional: Configure Environment**
   Create `.env` file (optional):
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ai-mock-interview
   ```

---

## 📝 Important Changes Made

### What Was Changed:

1. ✅ **CORS enabled** for all origins (allows Chrome/Edge to access backend)
2. ✅ **Clear terminal output** with backend URL prominently displayed
3. ✅ **No auto-open browser** code
4. ✅ **Explicit instructions** to use external browser

### Why These Changes:

- **CORS:** Your frontend (in Chrome) needs to make API calls to the backend
- **Clear output:** You need to see the URL to know the backend is ready
- **No auto-open:** Prevents VS Code from opening Simple Browser
- **Instructions:** Reminds you to use Chrome/Edge, not VS Code

---

## 🔌 MongoDB (Optional)

Currently running in **demo mode** without MongoDB. Database operations are skipped.

To enable MongoDB:
1. Install MongoDB from: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Uncomment MongoDB connection code in `server.js`

---

## 🛑 Stopping the Backend

Press `Ctrl+C` in the terminal to stop the Express server.

---

## 🆘 Troubleshooting

### Issue: "CORS error" in browser console
**Solution:** Backend must be running. Check terminal shows "Server running"

### Issue: "Connection refused"
**Solution:** 
- Backend not started yet
- Check port 5000 is not used by another app
- Run `npm install` if you haven't already

### Issue: "Camera/microphone blocked"
**Solution:** You're using VS Code Simple Browser. Close it and use Chrome/Edge.

### Issue: Dependencies failed to install
**Solution:**
- Update Node.js to latest version
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

---

## 📦 Key Dependencies

- **express** - Web framework
- **cors** - CORS middleware (configured for you!)
- **helmet** - Security headers
- **mongoose** - MongoDB ODM
- **natural** - NLP processing
- **sentiment** - Sentiment analysis

---

## 🎯 Complete Workflow

1. **Start backend** → See "Backend URL: http://localhost:5000" in terminal
2. **Start frontend server** (if needed) → `python -m http.server 8000`
3. **Open Chrome/Edge** (external browser)
4. **Navigate to** → http://localhost:8000
5. **Grant permissions** → Allow camera/microphone when prompted
6. **Use app** → Camera works, backend handles requests! ✨

---

**Remember:** Backend runs in terminal, frontend opens in external browser!
