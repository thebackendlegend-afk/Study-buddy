#!/bin/bash

# Study Buddy Backend - Quick Setup Script
# This script helps you deploy the backend to Railway

echo "🚀 Study Buddy Backend - Deployment Helper"
echo "==========================================="
echo ""

echo "Step 1: Install Railway CLI"
echo "Visit: https://docs.railway.app/cli/install"
echo "Or run: npm install -g @railway/cli"
echo ""

read -p "Press Enter after installing Railway CLI..."

echo ""
echo "Step 2: Login to Railway"
railway login
echo ""

echo "Step 3: Create new Railway project"
railway init
echo ""

echo "Step 4: Add environment variables"
echo "Go to: https://railway.app/dashboard"
echo "Add these variables:"
echo "  - PORT=5000"
echo "  - JWT_SECRET=your_secret"
echo "  - OPENROUTER_API_KEY=your_key"
echo "  - SENDGRID_API_KEY=your_key"
echo "  - TWILIO_ACCOUNT_SID=your_sid"
echo "  - TWILIO_AUTH_TOKEN=your_token"
echo "  - FIREBASE_* (all Firebase variables)"
echo ""

read -p "Press Enter after adding environment variables..."

echo ""
echo "Step 5: Deploy!"
railway up
echo ""

echo "✅ Backend deployed!"
echo "Your backend URL will be shown above."
echo ""
