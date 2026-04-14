#!/bin/bash

# Quick Start Script for GLM Chatbot Test

echo "🚀 GLM Chatbot Test - Quick Start"
echo "=================================="
echo ""

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please edit it and add your Z.AI API key."
    exit 0
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Test API connection
echo "🧪 Testing API connection..."
echo ""

/usr/bin/node test-api.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ API connection successful!"
    echo ""
    echo "🎉 Ready to start chatting!"
    echo "Run: npm start"
    echo ""
else
    echo ""
    echo "❌ API connection failed. Please check your API key in .env"
    exit 1
fi
