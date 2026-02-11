# AI Mock Interview - Stop Script
# This script stops all running servers

Write-Host "Stopping AI Mock Interview System..." -ForegroundColor Yellow

# Stop Python servers
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*http.server*"} | Stop-Process -Force
Write-Host "✓ Stopped frontend server" -ForegroundColor Green

# Stop Node.js servers
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✓ Stopped backend server" -ForegroundColor Green

Write-Host ""
Write-Host "All servers stopped." -ForegroundColor Green
