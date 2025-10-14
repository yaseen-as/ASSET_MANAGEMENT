#!/bin/bash

# Simple Asset Management System Setup
# Microservices with TanStack Query Frontend

set -e

echo "🚀 Asset Management System - Quick Setup"
echo "========================================"
echo ""

# Check basic requirements
echo "Checking requirements..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose"
    exit 1
fi

echo "✅ Requirements check passed"
echo ""

# Create basic .env if missing
if [ ! -f ".env" ]; then
    echo "Creating basic .env file..."
    cat > .env << 'ENVEOF'
# Basic Configuration
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
ANGEL_ONE_API_KEY=your-angel-one-api-key
ANGEL_ONE_CLIENT_ID=your-angel-one-client-id
ENVEOF
    echo "✅ .env file created"
fi

# Install dependencies
echo "Installing dependencies..."

# Frontend
if [ -f "frontend/package.json" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    echo "✅ Frontend dependencies installed"
fi

# Auth service
if [ -f "services/auth/package.json" ]; then
    echo "Installing auth service dependencies..."
    cd services/auth && npm install && cd ../..
    echo "✅ Auth service dependencies installed"
fi

# Portfolio service
if [ -f "services/portfolio/package.json" ]; then
    echo "Installing portfolio service dependencies..."
    cd services/portfolio && npm install && cd ../..
    echo "✅ Portfolio service dependencies installed"
fi

# Market data service
if [ -f "services/market-data/package.json" ]; then
    echo "Installing market data service dependencies..."
    cd services/market-data && npm install && cd ../..
    echo "✅ Market data service dependencies installed"
fi

# E2E tests (optional)
if [ -f "e2e/package.json" ]; then
    echo "Installing E2E test dependencies..."
    cd e2e && npm install && cd ..
    echo "✅ E2E test dependencies installed"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Update .env with your actual API credentials"
echo "2. Start development: ./scripts/manage.sh dev"
echo "3. Visit: http://localhost:3000"
echo ""
echo "Available commands:"
echo "  ./scripts/manage.sh dev     # Start development"
echo "  ./scripts/manage.sh stop    # Stop services"
echo "  ./scripts/manage.sh status  # Check status"
echo ""
