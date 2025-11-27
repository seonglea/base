#!/bin/bash

echo "🔍 Farcaster Auth Debugger"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local NOT FOUND"
  echo "   Create it first:"
  echo "   cp .env.example .env.local"
  echo ""
  exit 1
fi

# Check Neynar configuration
echo "📋 Environment Variables:"
echo "-------------------------"

if grep -q "NEXT_PUBLIC_NEYNAR_CLIENT_ID=" .env.local; then
  CLIENT_ID=$(grep "NEXT_PUBLIC_NEYNAR_CLIENT_ID=" .env.local | cut -d'=' -f2)
  if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" = "your_neynar_client_id_here" ]; then
    echo "❌ NEXT_PUBLIC_NEYNAR_CLIENT_ID is empty or not set"
  else
    echo "✅ NEXT_PUBLIC_NEYNAR_CLIENT_ID: ${CLIENT_ID:0:10}..."
  fi
else
  echo "❌ NEXT_PUBLIC_NEYNAR_CLIENT_ID not found in .env.local"
fi

if grep -q "NEYNAR_API_KEY=" .env.local; then
  API_KEY=$(grep "NEYNAR_API_KEY=" .env.local | cut -d'=' -f2)
  if [ -z "$API_KEY" ] || [ "$API_KEY" = "your_neynar_api_key_here" ]; then
    echo "❌ NEYNAR_API_KEY is empty or not set"
  else
    echo "✅ NEYNAR_API_KEY: ${API_KEY:0:10}..."
  fi
else
  echo "❌ NEYNAR_API_KEY not found in .env.local"
fi

echo ""
echo "🌐 Expected Callback URL:"
echo "-------------------------"
echo "http://localhost:3000/api/auth/farcaster/callback"
echo ""
echo "⚠️  Make sure this URL is added to your Neynar app's"
echo "   Redirect URIs in the Neynar dashboard"
echo ""

# Check if server is running
echo "🖥️  Server Status:"
echo "-------------------------"
if lsof -i :3000 >/dev/null 2>&1; then
  echo "✅ Server is running on port 3000"
else
  echo "❌ Server is NOT running"
  echo "   Start it with: npm run dev"
fi

echo ""
echo "🔧 Next Steps:"
echo "-------------------------"
echo "1. Set NEXT_PUBLIC_NEYNAR_CLIENT_ID in .env.local"
echo "2. Set NEYNAR_API_KEY in .env.local"
echo "3. Add callback URL to Neynar dashboard"
echo "4. Restart the server: npm run dev"
echo "5. Try signing in again"
echo ""

# Test callback endpoint
echo "🧪 Testing Callback Endpoint:"
echo "-------------------------"
if lsof -i :3000 >/dev/null 2>&1; then
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/auth/farcaster/callback?fid=123" 2>/dev/null)
  if [ "$RESPONSE" = "302" ] || [ "$RESPONSE" = "307" ]; then
    echo "✅ Callback endpoint responds (redirect as expected)"
  elif [ "$RESPONSE" = "200" ]; then
    echo "⚠️  Callback endpoint responds but doesn't redirect"
  else
    echo "❌ Callback endpoint error: HTTP $RESPONSE"
  fi
else
  echo "⏭️  Skipped (server not running)"
fi

echo ""
