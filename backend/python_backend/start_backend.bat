@echo off
echo ============================================
echo AI Mock Interview - Python Backend
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)
echo.

echo [2/3] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo.

echo [3/3] Starting Flask backend...
echo.
echo Backend will be available at: http://localhost:5000
echo API Endpoint: http://localhost:5000/evaluate-answer
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

python app.py

pause
