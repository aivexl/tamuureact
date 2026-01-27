#!/bin/bash
# DEPLOYMENT INSTRUCTIONS - FIX ROUTING TO api.tamuu.id
# ═══════════════════════════════════════════════════════════════════════════════

echo "🚀 TAMUU API DEPLOYMENT - CORRECT ROUTING FIX"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "BEFORE YOU RUN THIS:"
echo "1. Make sure you have Cloudflare CLI installed: npm install -g wrangler@latest"
echo "2. Authenticate: wrangler login"
echo "3. You have the correct Cloudflare account access"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Navigate to API folder
cd apps/api

echo "📋 STEP 1: Verify wrangler.toml has correct routing"
echo "Looking for: [[routes]] pattern = \"api.tamuu.id/*\""
grep -n "api.tamuu.id" wrangler.toml
echo ""

echo "🔑 STEP 2: Ensure Gemini API Key is set in secrets"
echo "If not set, run: echo 'YOUR_API_KEY' | wrangler secret put GEMINI_API_KEY --env production"
echo ""

echo "🚀 STEP 3: Deploy to Cloudflare Workers with correct routing"
echo "Command:"
echo "  wrangler deploy --env production"
echo ""
echo "Running deployment..."
wrangler deploy --env production

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 VERIFY:"
echo "1. Check Cloudflare Dashboard: https://dash.cloudflare.com/"
echo "2. Go to Workers → tamuu-api-prod"
echo "3. Under Routes, should show: api.tamuu.id/* → tamuu-api-prod"
echo ""
echo "🧪 TEST:"
echo "curl -X POST https://api.tamuu.id/api/chat \\
  -H 'Content-Type: application/json' \\
  -d '{\"messages\":[{\"role\":\"user\",\"content\":\"Test\"}],\"userId\":\"test\"}'"
echo ""
echo "🎉 Frontend will automatically connect via: https://api.tamuu.id"
echo "   (configured in apps/web/src/lib/api.ts line 7-8)"
echo ""
