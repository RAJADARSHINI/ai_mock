@echo off
echo ================================================
echo   AI Mock Interview - Quick Start
echo ================================================
echo.

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d "%~dp0" && python -m http.server 8000"

timeout /t 2 /nobreak >nul

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ================================================
echo   Application Started!
echo ================================================
echo.
echo Frontend server running at: localhost:8000
echo Backend server running at:  localhost:5000
echo.
echo To access the application:
echo   1. Open your browser manually
echo   2. Navigate to: localhost:8000/index.html
echo.
echo Note: Use external browser (Chrome/Edge/Firefox)
echo       VS Code Simple Browser blocks camera/microphone
echo.
echo Press any key to exit (servers will keep running)...
pause >nul
