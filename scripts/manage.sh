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

# Check for port conflicts and clean up if needed
check_ports() {
    print_status "Checking for port conflicts..."
    
    # Check if common ports are in use
    local ports=(80 443 3000 3001 3002 3003 5432 5433 5434 9094 3100 8080 5050)
    local conflicts=false
    
    for port in "${ports[@]}"; do
        if lsof -i :$port > /dev/null 2>&1; then
            print_warning "Port $port is already in use"
            conflicts=true
        fi
    done
    
    if [ "$conflicts" = true ]; then
        print_warning "Stopping conflicting Docker containers..."
        docker stop $(docker ps -q) 2>/dev/null || true
        docker system prune -f
        print_status "Port conflicts resolved"
    fi
}

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    
    # Check and resolve port conflicts
    check_ports
    
    # Load development environment variables
    export $(grep -v '^#' .env.dev | xargs)
    
    # Start services with dev profile
    # docker-compose --env-file .env.dev --profile dev build
    # docker-compose --env-file .env.dev --profile dev up -d
    docker compose --env-file .env.dev --profile dev up --build

    cd services/auth
    npx prisma migrate dev --name "initial"
    cd ../portfolio
    npx prisma migrate dev --name "initial"
    cd ../market-data
    npx prisma migrate dev --name "initial"
    cd ../../

    print_status "Development environment started!"
    print_status "Services:"
    print_status "  - Frontend: http://localhost:3000"
    print_status "  - Auth Service: http://localhost:3001"
    print_status "  - Portfolio Service: http://localhost:3002"
    print_status "  - Market Service: http://localhost:3003"
    print_status "  - Prometheus: http://localhost:9094"
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
    
    # Stop all containers
    docker-compose --profile dev --profile test --profile prod --profile monitoring --profile ci down -v
    
    # Remove any package-lock.json files from root
    if [ -f "package-lock.json" ]; then
        print_warning "Removing package-lock.json from root directory..."
        rm package-lock.json
    fi
    
    # Clean Docker system
    docker system prune -f
    
    print_status "Cleanup completed."
}

# Clean dependencies and reinstall
clean_deps() {
    print_status "Cleaning all dependencies and reinstalling..."
    
    # Remove node_modules and package-lock.json from all services
    print_status "Removing node_modules and package-lock.json..."
    
    # Root cleanup
    rm -rf node_modules package-lock.json 2>/dev/null || true
    
    # Auth service
    rm -rf services/auth/node_modules services/auth/package-lock.json 2>/dev/null || true
    
    # Portfolio service
    rm -rf services/portfolio/node_modules services/portfolio/package-lock.json 2>/dev/null || true
    
    # Market data service
    rm -rf services/market-data/node_modules services/market-data/package-lock.json 2>/dev/null || true
    
    # Frontend
    rm -rf frontend/node_modules frontend/package-lock.json 2>/dev/null || true
    
    # E2E tests
    rm -rf e2e/node_modules e2e/package-lock.json 2>/dev/null || true
    
    # Reinstall dependencies
    install_deps
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
    
    # For workspace setup, we need to install from root and then create individual package-lock.json files
    print_status "Installing from root workspace..."
    npm install
    
    # Temporarily move root package.json to create individual package-lock.json files
    print_status "Creating individual package-lock.json files for Docker builds..."
    
    # Backup root package.json
    mv package.json package.json.workspace.bak
    
    # Auth service
    print_status "Setting up auth service dependencies..."
    cd services/auth
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in services/auth"
        cd ../..
        mv package.json.workspace.bak package.json
        exit 1
    fi
    # Remove any existing files and install to create fresh package-lock.json
    rm -f package-lock.json
    rm -rf node_modules
    npm install
    cd ../..
    
    # Portfolio service
    print_status "Setting up portfolio service dependencies..."
    cd services/portfolio
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in services/portfolio"
        cd ../..
        mv package.json.workspace.bak package.json
        exit 1
    fi
    rm -f package-lock.json
    rm -rf node_modules
    npm install
    cd ../..
    
    # Market data service
    print_status "Setting up market data service dependencies..."
    cd services/market-data
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in services/market-data"
        cd ../..
        mv package.json.workspace.bak package.json
        exit 1
    fi
    rm -f package-lock.json
    rm -rf node_modules
    npm install
    cd ../..
    
    # Frontend
    print_status "Setting up frontend dependencies..."
    cd frontend
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in frontend"
        cd ..
        mv package.json.workspace.bak package.json
        exit 1
    fi
    rm -f package-lock.json
    rm -rf node_modules
    npm install
    cd ..
    
    # Restore root package.json
    mv package.json.workspace.bak package.json
    
    # E2E tests
    print_status "Setting up E2E test dependencies..."
    cd e2e
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in e2e"
        cd ..
        exit 1
    fi
    npm install
    npx playwright install
    cd ..
    
    print_status "All dependencies installed successfully!"
    print_status "Package-lock.json files created in each service directory."
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
    "clean-deps")
        clean_deps
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
    "check-ports")
        check_ports
        ;;
    *)
        echo "Usage: $0 {dev|test|prod|stop|cleanup|clean-deps|test-all|logs [service]|status|install|check-ports}"
        echo ""
        echo "Commands:"
        echo "  dev        - Start development environment"
        echo "  test       - Start test environment" 
        echo "  prod       - Start production environment"
        echo "  stop       - Stop all services"
        echo "  cleanup    - Stop services and clean up volumes"
        echo "  clean-deps - Clean and reinstall all dependencies"
        echo "  test-all   - Run all tests"
        echo "  logs       - Show logs (optionally for specific service)"
        echo "  status     - Show service status"
        echo "  install    - Install dependencies for all services"
        echo "  check-ports- Check for port conflicts and resolve them"
        exit 1
        ;;
esac
