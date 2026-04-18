@echo off
echo.
echo ========================================
echo   AI Interview System - Server Startup
echo ========================================
echo.
echo Navigating to project folder...
cd /d "C:\Users\Darshini\Downloads\Ai mock\ai_mock"

echo.
echo Checking for existing processes on port 8000...
netstat -ano | findstr :8000 > nul
if %errorlevel% equ 0 (
    echo Found process using port 8000, killing it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a
    timeout /t 2 /nobreak
)

echo.
echo ========================================
echo Starting server on port 8000...
echo ========================================
echo.
npm start

pause
