#!/bin/bash

# Production application testing script

echo "🧪 Testing production application..."

# Check if URL is provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/test-production.sh <your-vercel-url>"
    echo "Example: ./scripts/test-production.sh https://hjemmeinventar.vercel.app"
    exit 1
fi

URL=$1
echo "🔗 Testing URL: $URL"

# Test 1: Basic connectivity
echo ""
echo "📡 Test 1: Basic connectivity..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Homepage accessible (HTTP $HTTP_STATUS)"
else
    echo "❌ Homepage not accessible (HTTP $HTTP_STATUS)"
    exit 1
fi

# Test 2: API endpoints
echo ""
echo "🔌 Test 2: API endpoints..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/trpc/categories.getAll")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ tRPC API accessible"
else
    echo "⚠️  tRPC API may not be ready (HTTP $API_STATUS)"
fi

# Test 3: Authentication pages
echo ""
echo "🔐 Test 3: Authentication pages..."
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/auth/signin")
if [ "$AUTH_STATUS" = "200" ]; then
    echo "✅ Authentication pages accessible"
else
    echo "❌ Authentication pages not accessible (HTTP $AUTH_STATUS)"
fi

# Test 4: Dashboard (should redirect to auth)
echo ""
echo "🏠 Test 4: Dashboard access..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/dashboard")
if [ "$DASHBOARD_STATUS" = "200" ] || [ "$DASHBOARD_STATUS" = "302" ] || [ "$DASHBOARD_STATUS" = "307" ]; then
    echo "✅ Dashboard accessible (HTTP $DASHBOARD_STATUS)"
else
    echo "❌ Dashboard not accessible (HTTP $DASHBOARD_STATUS)"
fi

# Test 5: PWA manifest
echo ""
echo "📱 Test 5: PWA features..."
MANIFEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/manifest.json")
if [ "$MANIFEST_STATUS" = "200" ]; then
    echo "✅ PWA manifest accessible"
else
    echo "❌ PWA manifest not accessible (HTTP $MANIFEST_STATUS)"
fi

# Test 6: Service Worker
SW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/sw.js")
if [ "$SW_STATUS" = "200" ]; then
    echo "✅ Service Worker accessible"
else
    echo "❌ Service Worker not accessible (HTTP $SW_STATUS)"
fi

echo ""
echo "🎉 Production testing completed!"
echo ""
echo "Manual testing checklist:"
echo "□ Open $URL in browser"
echo "□ Test sign up / sign in"
echo "□ Create a location"
echo "□ Add an item"
echo "□ Test QR scanner"
echo "□ Install as PWA on mobile"
echo ""
