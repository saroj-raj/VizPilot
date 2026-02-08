# Test Groq integration on production backend

Write-Host "🧪 Testing Groq Integration on Production Backend" -ForegroundColor Cyan
Write-Host "=" * 60

# Test file path (use your actual uploaded file)
$testData = @{
    domain = "sales"
    intent = "analyze revenue trends"
    columns = @("date", "revenue", "product", "quantity")
    hints = @{
        has_date = $true
        date_field = "date"
        measures = @("revenue", "quantity")
        categories = @("product")
    }
}

try {
    Write-Host "`n📤 Sending test request to Render backend..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod `
        -Uri 'https://elas-erp.onrender.com/api/upload' `
        -Method Post `
        -ContentType 'application/json' `
        -Body ($testData | ConvertTo-Json -Depth 10)
    
    Write-Host "`n✅ Response received!" -ForegroundColor Green
    Write-Host "📊 Groq Response:" -ForegroundColor Cyan
    Write-Host $response.groq_response
    
    if ($response.groq_response -match "Fallback") {
        Write-Host "`n⚠️  ISSUE FOUND: Groq is returning fallback mode!" -ForegroundColor Red
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  1. GROQ_API_KEY not set in Render environment" -ForegroundColor Yellow
        Write-Host "  2. Groq API quota exceeded" -ForegroundColor Yellow
        Write-Host "  3. Network/connectivity issue from Render" -ForegroundColor Yellow
        Write-Host "  4. Groq API error/timeout" -ForegroundColor Yellow
    } else {
        Write-Host "`n✅ Groq is working correctly!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "`n❌ Error testing Groq:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n" -NoNewline
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Check Render dashboard → Environment → GROQ_API_KEY" -ForegroundColor White
Write-Host "  2. Check Render logs for Groq errors" -ForegroundColor White
Write-Host "  3. Verify Groq API key is valid at https://console.groq.com" -ForegroundColor White
