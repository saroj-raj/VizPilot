# Elas ERP - Docker Stop Script
# This script stops all running Elas ERP containers

Write-Host "🛑 Stopping Elas ERP containers..." -ForegroundColor Yellow

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Stop containers
docker compose -f "docker-compose.yml" down

Write-Host ""
Write-Host "✓ All containers stopped" -ForegroundColor Green
