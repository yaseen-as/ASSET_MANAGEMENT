#!/bin/bash

# Quick setup script for new developers

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[SETUP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_status "Setting up Asset Management System development environment..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
./scripts/manage.sh install

# Copy example environment file
if [ ! -f ".env" ]; then
    print_status "Creating .env file from .env.dev..."
    cp .env.dev .env
    print_warning "Please review and update the .env file with your configuration!"
fi

# Create necessary directories
print_status "Creating required directories..."
mkdir -p services/auth/logs
mkdir -p services/portfolio/logs
mkdir -p services/market-data/logs
mkdir -p nginx/logs
mkdir -p nginx/ssl
mkdir -p e2e/test-results
mkdir -p e2e/reports

# Generate SSL certificates for development
print_status "Generating development SSL certificates..."
if [ ! -f "nginx/ssl/server.crt" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/server.key \
        -out nginx/ssl/server.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost"
fi

print_status "Setup completed!"
print_status ""
print_status "Next steps:"
print_status "1. Review and update the .env file"
print_status "2. Start the development environment: ./scripts/manage.sh dev"
print_status "3. Visit http://localhost to access the application"
print_status ""
print_status "Available commands:"
print_status "  ./scripts/manage.sh dev      # Start development environment"
print_status "  ./scripts/manage.sh test-all # Run all tests"
print_status "  ./scripts/manage.sh logs     # View logs"
print_status "  ./scripts/manage.sh stop     # Stop all services"
