#!/bin/bash

# Asset Management Development Environment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Dependencies check passed."
}

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    
    # Load development environment variables
    export $(grep -v '^#' .env.dev | xargs)
    
    # Start services with dev profile

    # docker-compose --env-file .env.dev --profile dev build
    # docker-compose --env-file .env.dev --profile dev up -d
    docker-compose --env-file .env.dev --profile dev up --build
    
    print_status "Development environment started!"
    print_status "Services:"
    print_status "  - Frontend: http://localhost:3000"
    print_status "  - Auth Service: http://localhost:3001"
    print_status "  - Portfolio Service: http://localhost:3002"
    print_status "  - Market Service: http://localhost:3003"
    print_status "  - Prometheus: http://localhost:9090"
    print_status "  - Grafana: http://localhost:3100 (admin/admin)"
}

# Start test environment
start_test() {
    print_status "Starting test environment..."
    
    # Load test environment variables
    export $(grep -v '^#' .env.test | xargs)
    
    # Start services with test profile
    docker-compose --env-file .env.test --profile test up -d --build
    
    print_status "Test environment started!"
}

# Start production environment
start_prod() {
    print_warning "Starting production environment..."
    print_warning "Make sure you have set all production environment variables!"
    
    # Check if production secrets are set
    if [ -z "$PROD_JWT_SECRET" ]; then
        print_error "PROD_JWT_SECRET environment variable is not set!"
        exit 1
    fi
    
    # Load production environment variables
    export $(grep -v '^#' .env.prod | xargs)
    
    # Start services with prod profile
    docker-compose --env-file .env.prod --profile prod up -d --build
    
    print_status "Production environment started!"
}

# Stop all services
stop_all() {
    print_status "Stopping all services..."
    docker-compose --profile dev --profile test --profile prod --profile monitoring --profile ci down
    print_status "All services stopped."
}

# Clean up everything
cleanup() {
    print_status "Cleaning up..."
    docker-compose --profile dev --profile test --profile prod --profile monitoring --profile ci down -v
    docker system prune -f
    print_status "Cleanup completed."
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Start test environment
    start_test
    
    # Wait for services to be ready
    sleep 30
    
    # Run unit tests
    print_status "Running unit tests..."
    docker-compose exec auth-service npm run test:unit
    docker-compose exec portfolio-service npm run test:unit
    docker-compose exec market-service npm run test:unit
    
    # Run integration tests
    print_status "Running integration tests..."
    docker-compose exec auth-service npm run test:integration
    docker-compose exec portfolio-service npm run test:integration
    docker-compose exec market-service npm run test:integration
    
    # Run E2E tests
    print_status "Running E2E tests..."
    docker-compose run --rm e2e-tests npm run test:e2e
    
    print_status "All tests completed!"
}

# Show logs
show_logs() {
    local service=${1:-}
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Show status
show_status() {
    print_status "Service status:"
    docker-compose ps
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies for all services..."
    
    # Auth service
    cd services/auth && npm install && cd ../..
    
    # Portfolio service
    cd services/portfolio && npm install && cd ../..
    
    # Market data service
    cd services/market-data && npm install && cd ../..
    
    # Frontend
    cd frontend && npm install && cd ..
    
    # E2E tests
    cd e2e && npm install && npx playwright install && cd ..
    
    print_status "All dependencies installed!"
}

# Main script logic
case "$1" in
    "dev")
        check_dependencies
        start_dev
        ;;
    "test")
        check_dependencies
        start_test
        ;;
    "prod")
        check_dependencies
        start_prod
        ;;
    "stop")
        stop_all
        ;;
    "cleanup")
        cleanup
        ;;
    "test-all")
        check_dependencies
        run_tests
        ;;
    "logs")
        show_logs "$2"
        ;;
    "status")
        show_status
        ;;
    "install")
        install_deps
        ;;
    *)
        echo "Usage: $0 {dev|test|prod|stop|cleanup|test-all|logs [service]|status|install}"
        echo ""
        echo "Commands:"
        echo "  dev       - Start development environment"
        echo "  test      - Start test environment" 
        echo "  prod      - Start production environment"
        echo "  stop      - Stop all services"
        echo "  cleanup   - Stop services and clean up volumes"
        echo "  test-all  - Run all tests"
        echo "  logs      - Show logs (optionally for specific service)"
        echo "  status    - Show service status"
        echo "  install   - Install dependencies for all services"
        exit 1
        ;;
esac
