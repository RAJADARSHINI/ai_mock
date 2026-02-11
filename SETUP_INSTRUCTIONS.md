# 🚀 AI Mock Interview - Setup Instructions

## ⚠️ IMPORTANT: Camera & Microphone Access

**DO NOT use VS Code's Simple Browser, Live Preview, or internal WebView!**

These VS Code features **block camera and microphone access** for security reasons. You **must** open your application in a **real external browser** (Chrome, Edge, or Firefox).

---

## 📋 Quick Start Guide

### Option 1: Python Backend (Flask)

1. **Open Terminal in VS Code** (Terminal → New Terminal)

2. **Navigate to Python backend:**
   ```powershell
   cd python_backend
   ```

3. **Start the backend:**
   ```powershell
   python app.py
   ```
   
4. **Keep the terminal running** - you'll see:
   ```
   ======================================================================
   🚀 AI MOCK INTERVIEW - PYTHON BACKEND
   ======================================================================
   
   📡 BACKEND URL:  http://localhost:5000
   📡 API ENDPOINT: http://localhost:5000/evaluate-answer
   ======================================================================
   ```

5. **Open Chrome/Edge browser** (external, not in VS Code)

6. **Navigate to your frontend:**
   - If using a frontend server: `http://localhost:8000`
   - Or open the HTML file directly in browser

7. **Grant camera/microphone permissions** when prompted

---

### Option 2: Node Backend (Express)

1. **Open Terminal in VS Code** (Terminal → New Terminal)

2. **Navigate to Node backend:**
   ```powershell
   cd backend
   ```

3. **Install dependencies (first time only):**
   ```powershell
   npm install
   ```

4. **Start the backend:**
   ```powershell
   npm start
   ```
   
5. **Keep the terminal running** - you'll see:
   ```
   ======================================================================
   🚀 AI MOCK INTERVIEW - NODE BACKEND
   ======================================================================
   
   📡 BACKEND URL:  http://localhost:5000
   📡 API ENDPOINT: http://localhost:5000/api/
   ======================================================================
   ```

6. **Open Chrome/Edge browser** (external, not in VS Code)

7. **Navigate to your frontend:**
   - If using a frontend server: `http://localhost:8000`
   - Or open the HTML file directly in browser

8. **Grant camera/microphone permissions** when prompted

---

## 🌐 Serving the Frontend

Your frontend HTML/CSS/JS files need to be served via HTTP (not file://) for APIs to work properly.

**Option A: Python HTTP Server** (Recommended)
```powershell
# In the project root directory
python -m http.server 8000
```
Then open: `http://localhost:8000`

**Option B: Node HTTP Server**
```powershell
npx http-server -p 8000
```
Then open: `http://localhost:8000`

**Option C: VS Code Live Server Extension**
- Install "Live Server" extension
- Right-click on `index.html` → "Open with Live Server"
- ⚠️ Make sure it opens in external browser, not VS Code!

---

## ✅ Verification Checklist

- [ ] Backend is running in VS Code terminal
- [ ] Backend URL is printed in terminal (http://localhost:5000)
- [ ] Frontend is opened in **Chrome or Edge** (not VS Code)
- [ ] Frontend URL is http://localhost:8000 (not file:///)
- [ ] Camera/microphone permissions are granted in browser
- [ ] No VS Code Simple Browser windows opened
- [ ] Browser console shows no CORS errors

---

## 🔧 CORS Configuration

Both backends are now configured with proper CORS settings to allow requests from any origin during local development:

### Python Backend (Flask)
- ✅ Accepts requests from any origin (`*`)
- ✅ Supports GET, POST, OPTIONS methods
- ✅ Allows Content-Type and Authorization headers

### Node Backend (Express)
- ✅ Accepts requests from any origin (`*`)
- ✅ Supports GET, POST, PUT, DELETE, OPTIONS methods
- ✅ Allows Content-Type and Authorization headers

---

## 🛑 Common Issues & Solutions

### Issue: "Camera/microphone blocked"
**Solution:** You're using VS Code Simple Browser. Close it and open in Chrome/Edge.

### Issue: "CORS error" in browser console
**Solution:** 
- Ensure backend is running
- Check frontend is accessed via http:// (not file://)
- Restart backend if you just updated the code

### Issue: "Connection refused" or "Cannot connect to backend"
**Solution:**
- Check backend terminal is still running
- Verify backend printed "Backend URL: http://localhost:5000"
- Check no other app is using port 5000

### Issue: VS Code keeps auto-opening Simple Browser
**Solution:** 
- Settings are configured to prevent this
- If it still happens, manually close the Simple Browser tab
- Always use external Chrome/Edge browser instead

---

## 📝 VS Code Settings

The `.vscode/settings.json` is configured to prevent auto-opening:
- ✅ Auto port forwarding disabled
- ✅ Terminal link detection disabled
- ✅ Simple Browser and Live Preview disabled
- ✅ Port 5000 and 8000 set to "ignore" for auto-forward

---

## 🎯 Workflow Summary

1. **Terminal:** Start backend → See URL printed
2. **Browser:** Open Chrome/Edge (external)
3. **Navigate:** Go to frontend URL (http://localhost:8000)
4. **Permissions:** Allow camera/microphone when prompted
5. **Use App:** Camera works → Backend processes requests → Success! ✨

---

## 🆘 Need Help?

If you're still having issues:
1. Check backend terminal shows "Backend ready"
2. Verify frontend is in Chrome/Edge (check browser name in title bar)
3. Open browser DevTools (F12) → Check Console for errors
4. Verify URLs match (backend: :5000, frontend: :8000)
5. Restart both backend and frontend

**Remember:** The backend runs in the terminal, frontend opens in external browser!
