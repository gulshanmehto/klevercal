#!/bin/bash

# Quick Backend Deployment Guide
# Since gcloud CLI may not be installed

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Deploy Backend - Quick Guide"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if changes are committed
if git diff --quiet && git diff --cached --quiet; then
    echo "✅ No uncommitted changes"
else
    echo "📝 You have uncommitted changes. Commit them first:"
    echo ""
    echo "   git add backend/server.py"
    echo "   git commit -m 'Fix Zoom OAuth to use backend redirect URI'"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deployment Options:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option 1: Via Google Cloud Console (Web UI) ✨ RECOMMENDED"
echo "   1. Go to https://console.cloud.google.com/run"
echo "   2. Click on 'klevercal-api' service"
echo "   3. Click 'EDIT & DEPLOY NEW REVISION'"
echo "   4. Click 'DEPLOY'"
echo "   5. Wait for deployment to complete"
echo ""
echo "Option 2: Via gcloud CLI (if installed)"
echo "   Step 1: Install gcloud CLI"
echo "      Mac: brew install google-cloud-sdk"
echo "      Or: https://cloud.google.com/sdk/docs/install"
echo ""
echo "   Step 2: Login"
echo "      gcloud auth login"
echo ""
echo "   Step 3: Deploy"
echo "      cd backend"
echo "      gcloud run deploy klevercal-api --source . --region us-central1 --allow-unauthenticated"
echo ""
echo "Option 3: Via Git Push (if connected to Cloud Build)"
echo "   git push origin main"
echo "   (Cloud Build will auto-deploy if configured)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 After deployment:"
echo "   Test at: https://deemeet.in/integrations"
echo ""
