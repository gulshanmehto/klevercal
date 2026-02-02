#!/bin/bash

# KleverCal Full Deployment Script
# Deploys both backend and frontend

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 KleverCal Full Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask what to deploy
echo "What would you like to deploy?"
echo "  1) Backend only (Cloud Run)"
echo "  2) Frontend only (Vercel)"
echo "  3) Both backend and frontend"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying Backend..."
        ./deploy-backend.sh
        ;;
    2)
        echo ""
        echo "📦 Deploying Frontend..."
        echo ""
        echo "For frontend deployment:"
        echo "  1. Push your changes to Git"
        echo "  2. Vercel will auto-deploy from your repo"
        echo ""
        echo "Or run manually:"
        echo "  cd frontend && vercel --prod"
        ;;
    3)
        echo ""
        echo "📦 Deploying Backend first..."
        ./deploy-backend.sh
        
        echo ""
        echo "📦 Frontend deployment..."
        echo ""
        echo "For frontend deployment:"
        echo "  1. Push your changes to Git"
        echo "  2. Vercel will auto-deploy from your repo"
        echo ""
        echo "Or run manually:"
        echo "  cd frontend && vercel --prod"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Deployment process complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
