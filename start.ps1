# AI Mock Interview - Professional Startup Script
# This script starts both frontend and backend servers

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  AI Mock Interview System - Starting..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "[1/4] Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = Get-Process -Name mongod -ErrorAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠ MongoDB is not running" -ForegroundColor Red
    Write-Host "   Backend will not work without MongoDB" -ForegroundColor Red
    Write-Host "   Install from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue with frontend only? (Y/N)"
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit
    }
}

Write-Host ""
Write-Host "[2/4] Starting Backend Server..." -ForegroundColor Yellow

# Start backend in new window
$backendPath = Join-Path $PSScriptRoot "backend"
if (Test-Path $backendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Cyan; npm run dev"
    Write-Host "✓ Backend started on http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "⚠ Backend folder not found" -ForegroundColor Red
}

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "[3/4] Starting Frontend Server..." -ForegroundColor Yellow

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host 'Frontend Server Starting...' -ForegroundColor Cyan; python -m http.server 8000"
Write-Host "✓ Frontend started on http://localhost:8000" -ForegroundColor Green

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  ✓ Application is running!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Server Addresses:" -ForegroundColor Cyan
Write-Host "  Frontend: localhost:8000" -ForegroundColor White
Write-Host "  Backend:  localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Open in external browser (Chrome/Edge/Firefox)" -ForegroundColor Yellow
Write-Host "  Navigate to: localhost:8000/index.html" -ForegroundColor White
Write-Host ""
Write-Host "Why external browser?" -ForegroundColor Cyan
Write-Host "  VS Code Simple Browser blocks camera/microphone access" -ForegroundColor White
Write-Host "  for security reasons. Use a regular browser instead." -ForegroundColor White
Write-Host ""
Write-Host "To stop: Close the PowerShell windows or press Ctrl+C" -ForegroundColor Yellow
Write-Host ""
