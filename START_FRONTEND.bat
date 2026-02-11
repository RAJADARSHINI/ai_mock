@echo off
echo ================================================================================
echo AI MOCK INTERVIEW - FRONTEND SERVER
echo ================================================================================
echo.
echo Starting HTTP server for frontend...
echo This will serve your HTML/CSS/JS files
echo.
cd /d "%~dp0"
echo.
echo Frontend will be available at: http://localhost:8000
echo.
echo IMPORTANT: Open in CHROME or EDGE (not VS Code Simple Browser)
echo            Grant camera/microphone permissions when prompted
echo.
echo ================================================================================
echo.
python -m http.server 8000
pause
