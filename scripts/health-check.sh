#!/bin/bash

# Asset Management System Health Check Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Asset Management System Health Check${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check Docker and Docker Compose
print_info "Checking prerequisites..."
if command -v docker &> /dev/null; then
    print_status "Docker installed: $(docker --version | cut -d' ' -f3)"
else
    print_error "Docker not installed"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    print_status "Docker Compose installed: $(docker-compose --version | cut -d' ' -f4)"
else
    print_error "Docker Compose not installed"
    exit 1
fi

# Check if services are running
print_info "Checking service health..."

check_service() {
    local service_name=$1
    local port=$2
    local path=${3:-/health}
    
    if curl -s -f "http://localhost:$port$path" > /dev/null 2>&1; then
        print_status "$service_name (port $port) - Healthy"
    else
        print_error "$service_name (port $port) - Not responding"
    fi
}

check_service "Frontend" "3000" "/"
check_service "Auth Service" "3001" "/health"
check_service "Portfolio Service" "3002" "/health"
check_service "Market Data Service" "3003" "/health"
check_service "Nginx Reverse Proxy" "80" "/"

# Check databases
print_info "Checking database connectivity..."

check_database() {
    local db_name=$1
    local port=$2
    local user=$3
    local db=$4
    
    if docker exec -i ${db_name} pg_isready -U $user -d $db &> /dev/null; then
        print_status "$db_name database - Connected"
    else
        print_error "$db_name database - Connection failed"
    fi
}

check_database "auth-db" "5432" "auth_user" "auth_db"
check_database "portfolio-db" "5433" "portfolio_user" "portfolio_db"
check_database "market-db" "5434" "market_user" "market_db"

# Check monitoring stack
print_info "Checking monitoring stack..."
check_service "Prometheus" "9090" "/api/v1/status/config"
check_service "Grafana" "3100" "/api/health"

# Check API endpoints
print_info "Checking API endpoints..."

check_api() {
    local endpoint=$1
    local description=$2
    
    if curl -s -f "$endpoint" > /dev/null 2>&1; then
        print_status "$description - Available"
    else
        print_warning "$description - Not accessible (service may be starting)"
    fi
}

check_api "http://localhost:3001/api/docs" "Auth Service API Documentation"
check_api "http://localhost:3002/api/docs" "Portfolio Service API Documentation"
check_api "http://localhost:3003/api/docs" "Market Service API Documentation"
check_api "http://localhost:3001/metrics" "Auth Service Metrics"
check_api "http://localhost:3002/metrics" "Portfolio Service Metrics"
check_api "http://localhost:3003/metrics" "Market Service Metrics"

# Check logs directory
print_info "Checking log directories..."
for service in auth portfolio market-data; do
    if [ -d "services/$service/logs" ]; then
        print_status "services/$service/logs directory exists"
    else
        print_warning "services/$service/logs directory missing"
        mkdir -p "services/$service/logs"
        print_status "Created services/$service/logs directory"
    fi
done

# Check environment configuration
print_info "Checking environment configuration..."
if [ -f ".env" ]; then
    print_status ".env file exists"
else
    print_warning ".env file missing - using .env.dev"
    if [ -f ".env.dev" ]; then
        cp .env.dev .env
        print_status "Copied .env.dev to .env"
    fi
fi

# Check for required environment variables
required_vars=("JWT_SECRET" "JWT_REFRESH_SECRET")
for var in "${required_vars[@]}"; do
    if grep -q "^$var=" .env 2>/dev/null; then
        print_status "Environment variable $var is set"
    else
        print_warning "Environment variable $var not found in .env"
    fi
done

# Check Docker containers status
print_info "Checking Docker containers..."
if docker-compose ps | grep -q "Up"; then
    running_containers=$(docker-compose ps | grep "Up" | wc -l)
    print_status "$running_containers containers are running"
    
    # Show container status
    docker-compose ps
else
    print_warning "No containers are currently running"
    print_info "Start services with: ./scripts/manage.sh dev"
fi

# Performance check
print_info "Running basic performance check..."
if command -v curl &> /dev/null; then
    start_time=$(date +%s%N)
    if curl -s -f "http://localhost" > /dev/null 2>&1; then
        end_time=$(date +%s%N)
        duration=$(((end_time - start_time) / 1000000))
        
        if [ $duration -lt 1000 ]; then
            print_status "Frontend response time: ${duration}ms (Excellent)"
        elif [ $duration -lt 3000 ]; then
            print_status "Frontend response time: ${duration}ms (Good)"
        else
            print_warning "Frontend response time: ${duration}ms (Slow)"
        fi
    fi
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Health Check Complete${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}Quick Access URLs:${NC}"
echo "• Application: http://localhost"
echo "• Auth API Docs: http://localhost:3001/api/docs"
echo "• Portfolio API Docs: http://localhost:3002/api/docs" 
echo "• Market API Docs: http://localhost:3003/api/docs"
echo "• Prometheus: http://localhost:9090"
echo "• Grafana: http://localhost:3100 (admin/admin)"
echo ""
echo -e "${GREEN}Management Commands:${NC}"
echo "• Start dev environment: ./scripts/manage.sh dev"
echo "• Run tests: ./scripts/manage.sh test-all"
echo "• View logs: ./scripts/manage.sh logs [service]"
echo "• Stop services: ./scripts/manage.sh stop"
