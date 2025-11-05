# sync-to-deployment.ps1
# Syncs elas-erp (master) to artie-dashboard (deployment) folder

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  📦 ELAS ERP - Deployment Sync Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$sourceRoot = "$PSScriptRoot\elas-erp"
$deployRoot = "$PSScriptRoot\artie-dashboard"

# Check if source exists
if (-not (Test-Path $sourceRoot)) {
    Write-Host "❌ Source folder not found: $sourceRoot" -ForegroundColor Red
    exit 1
}

# Check if deployment folder exists
if (-not (Test-Path $deployRoot)) {
    Write-Host "❌ Deployment folder not found: $deployRoot" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Source: $sourceRoot" -ForegroundColor Green
Write-Host "✅ Target: $deployRoot`n" -ForegroundColor Green

# Sync Backend
Write-Host "🔄 Syncing Backend..." -ForegroundColor Yellow

$sourceBackend = "$sourceRoot\backend"
$deployBackend = "$deployRoot\backend"

# Files to sync in backend
$backendFiles = @(
    "app\*",
    "requirements.txt",
    ".env",
    ".env.example",
    "render.yaml",
    "railway.json"
)

foreach ($file in $backendFiles) {
    $sourcePath = Join-Path $sourceBackend $file
    $destPath = Join-Path $deployBackend $file
    
    if (Test-Path $sourcePath) {
        # Create destination directory if needed
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        if ($file -like "*\*") {
            # Copy directory recursively
            Copy-Item -Path $sourcePath -Destination (Split-Path $destPath -Parent) -Recurse -Force
            Write-Host "  ✓ Copied: $file" -ForegroundColor Green
        } else {
            # Copy single file
            Copy-Item -Path $sourcePath -Destination $destPath -Force
            Write-Host "  ✓ Copied: $file" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠ Skipped (not found): $file" -ForegroundColor DarkYellow
    }
}

Write-Host "`n🔄 Syncing Frontend..." -ForegroundColor Yellow

$sourceFrontend = "$sourceRoot\frontend"
$deployFrontend = "$deployRoot\frontend"

# Directories to sync in frontend
$frontendDirs = @(
    "app",
    "components",
    "lib",
    "public"
)

foreach ($dir in $frontendDirs) {
    $sourcePath = Join-Path $sourceFrontend $dir
    $destPath = Join-Path $deployFrontend $dir
    
    if (Test-Path $sourcePath) {
        # Remove old directory
        if (Test-Path $destPath) {
            Remove-Item -Path $destPath -Recurse -Force
        }
        
        # Copy new directory
        Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
        Write-Host "  ✓ Synced: $dir\" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipped (not found): $dir\" -ForegroundColor DarkYellow
    }
}

# Files to sync in frontend
$frontendFiles = @(
    "package.json",
    "next.config.js",
    "tsconfig.json",
    "tailwind.config.js",
    "postcss.config.js",
    ".env.production"
)

foreach ($file in $frontendFiles) {
    $sourcePath = Join-Path $sourceFrontend $file
    $destPath = Join-Path $deployFrontend $file
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  ✓ Copied: $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipped (not found): $file" -ForegroundColor DarkYellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ Sync Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Review changes in artie-dashboard/" -ForegroundColor White
Write-Host "   2. git add -A" -ForegroundColor White
Write-Host "   3. git commit -m 'Sync real project to deployment'" -ForegroundColor White
Write-Host "   4. git push origin main" -ForegroundColor White
Write-Host "`n   Vercel and Render will auto-deploy the real project!`n" -ForegroundColor Cyan
