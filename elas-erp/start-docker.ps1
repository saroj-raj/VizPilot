# Elas ERP - Docker Quick Start Script
# This script builds and runs both backend and frontend containers together

Write-Host "🚀 Starting Elas ERP with Docker..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "✓ In directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Start Docker Compose
Write-Host "📦 Building and starting containers..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes on first run (downloading images & installing packages)" -ForegroundColor Gray
Write-Host ""

docker compose -f "docker-compose.yml" up --build

# Note: Press Ctrl+C to stop both containers
