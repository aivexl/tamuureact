# DEPLOYMENT INSTRUCTIONS - FIX ROUTING TO api.tamuu.id
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "🚀 TAMUU API DEPLOYMENT - CORRECT ROUTING FIX" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "BEFORE YOU RUN THIS:" -ForegroundColor Yellow
Write-Host "1. Make sure you have Cloudflare CLI installed: npm install -g wrangler@latest" -ForegroundColor White
Write-Host "2. Authenticate: wrangler login" -ForegroundColor White
Write-Host "3. You have the correct Cloudflare account access" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Navigate to API folder
Set-Location apps/api

Write-Host "📋 STEP 1: Verify wrangler.toml has correct routing" -ForegroundColor Yellow
Write-Host "Looking for: [[routes]] pattern = 'api.tamuu.id/*'" -ForegroundColor White
Select-String -Path wrangler.toml -Pattern "api.tamuu.id" | ForEach-Object { Write-Host $_.Line -ForegroundColor Green }
Write-Host ""

Write-Host "🔑 STEP 2: Ensure Gemini API Key is set in secrets" -ForegroundColor Yellow
Write-Host "If not set, run: echo 'YOUR_API_KEY' | wrangler secret put GEMINI_API_KEY --env production" -ForegroundColor White
Write-Host ""

Write-Host "🚀 STEP 3: Deploy to Cloudflare Workers with correct routing" -ForegroundColor Yellow
Write-Host "Command:" -ForegroundColor White
Write-Host "  wrangler deploy --env production" -ForegroundColor Cyan
Write-Host ""
Write-Host "Running deployment..." -ForegroundColor White
Write-Host ""

# Deploy
& wrangler deploy --env production

Write-Host ""
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 VERIFY:" -ForegroundColor Cyan
Write-Host "1. Check Cloudflare Dashboard: https://dash.cloudflare.com/" -ForegroundColor White
Write-Host "2. Go to Workers → tamuu-api-prod" -ForegroundColor White
Write-Host "3. Under Routes, should show: api.tamuu.id/* → tamuu-api-prod" -ForegroundColor White
Write-Host ""
Write-Host "🧪 TEST:" -ForegroundColor Cyan
Write-Host 'Invoke-WebRequest -Uri "https://api.tamuu.id/api/chat" -Method POST -Headers @{"Content-Type"="application/json"} -Body ''{"messages":[{"role":"user","content":"Test"}],"userId":"test"}'' -UseBasicParsing | Select-Object -ExpandProperty Content' -ForegroundColor White
Write-Host ""
Write-Host "🎉 Frontend will automatically connect via: https://api.tamuu.id" -ForegroundColor Green
Write-Host "   (configured in apps/web/src/lib/api.ts line 7-8)" -ForegroundColor Green
Write-Host ""
