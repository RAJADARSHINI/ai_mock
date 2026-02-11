@echo off
echo ========================================
echo Starting AI Mock Interview Backend
echo ========================================
echo.
echo Backend will be available at: localhost:5000
echo API endpoints at: localhost:5000/api/
echo.
echo Note: Use terminal only, do not open in browser
echo.
cd /d "%~dp0"
set NODE_ENV=development
node server.js
pause
