#!/bin/bash

# Nginx Debug Script for Asset Management Project
# This script helps debug nginx proxy issues

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test nginx configuration
test_nginx_config() {
    print_header "Testing Nginx Configuration"
    
    if docker-compose ps nginx-dev | grep -q "Up"; then
        docker-compose exec nginx-dev nginx -t
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx container is not running"
        return 1
    fi
}

# Test service connectivity
test_service_connectivity() {
    print_header "Testing Service Connectivity"
    
    # Test if services are running
    services=("auth-service-dev:3001" "portfolio-service-dev:3002" "market-service-dev:3003" "frontend-dev:3000")
    
    for service in "${services[@]}"; do
        service_name=$(echo $service | cut -d':' -f1)
        port=$(echo $service | cut -d':' -f2)
        
        if docker-compose ps $service_name | grep -q "Up"; then
            print_success "$service_name is running"
        else
            print_error "$service_name is not running"
        fi
    done
}

# Test nginx routes
test_nginx_routes() {
    print_header "Testing Nginx Routes"
    
    echo "Testing nginx health endpoint..."
    if curl -s http://localhost:8080/nginx-health | grep -q "healthy"; then
        print_success "Nginx health check passed"
    else
        print_error "Nginx health check failed"
    fi
    
    echo "Testing API health endpoint..."
    if curl -s http://localhost:8080/api/health | grep -q "status"; then
        print_success "API health check passed"
    else
        print_error "API health check failed"
    fi
    
    echo "Testing auth route (should return 404 or auth response)..."
    response=$(curl -s -w "%{http_code}" http://localhost:8080/auth/health -o /dev/null)
    if [ "$response" -eq "200" ] || [ "$response" -eq "404" ] || [ "$response" -eq "401" ]; then
        print_success "Auth route is proxying (HTTP $response)"
    else
        print_error "Auth route proxy failed (HTTP $response)"
    fi
    
    echo "Testing frontend route..."
    if curl -s http://localhost:8080/ | grep -q "<!DOCTYPE html>"; then
        print_success "Frontend route is working"
    else
        print_error "Frontend route failed"
    fi
}

# Show nginx logs
show_nginx_logs() {
    print_header "Nginx Logs (last 20 lines)"
    
    if docker-compose ps nginx-dev | grep -q "Up"; then
        echo "=== Access Logs ==="
        docker-compose exec nginx-dev tail -n 20 /var/log/nginx/access.log 2>/dev/null || echo "No access logs yet"
        
        echo -e "\n=== Error Logs ==="
        docker-compose exec nginx-dev tail -n 20 /var/log/nginx/error.log 2>/dev/null || echo "No error logs yet"
    else
        print_error "Nginx container is not running"
    fi
}

# Test API endpoints through nginx
test_api_endpoints() {
    print_header "Testing API Endpoints Through Nginx"
    
    # Test auth endpoint
    echo "Testing POST /auth/login..."
    response=$(curl -s -X POST http://localhost:8080/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"testpass"}' \
        -w "%{http_code}" -o /dev/null)
    
    if [ "$response" -eq "200" ] || [ "$response" -eq "401" ] || [ "$response" -eq "404" ]; then
        print_success "Auth login endpoint responding (HTTP $response)"
    else
        print_error "Auth login endpoint failed (HTTP $response)"
    fi
    
    # Test portfolio endpoint
    echo "Testing GET /portfolio..."
    response=$(curl -s http://localhost:8080/portfolio -w "%{http_code}" -o /dev/null)
    
    if [ "$response" -eq "200" ] || [ "$response" -eq "401" ] || [ "$response" -eq "404" ]; then
        print_success "Portfolio endpoint responding (HTTP $response)"
    else
        print_error "Portfolio endpoint failed (HTTP $response)"
    fi
    
    # Test market endpoint
    echo "Testing GET /market..."
    response=$(curl -s http://localhost:8080/market -w "%{http_code}" -o /dev/null)
    
    if [ "$response" -eq "200" ] || [ "$response" -eq "401" ] || [ "$response" -eq "404" ]; then
        print_success "Market endpoint responding (HTTP $response)"
    else
        print_error "Market endpoint failed (HTTP $response)"
    fi
}

# Show service status
show_service_status() {
    print_header "Service Status"
    
    docker-compose ps | grep -E "(nginx-dev|auth-service-dev|portfolio-service-dev|market-service-dev|frontend-dev)"
}

# Restart nginx
restart_nginx() {
    print_header "Restarting Nginx"
    
    docker-compose restart nginx-dev
    sleep 3
    
    if docker-compose ps nginx-dev | grep -q "Up"; then
        print_success "Nginx restarted successfully"
    else
        print_error "Failed to restart nginx"
    fi
}

# Main menu
show_menu() {
    echo -e "\n${BLUE}Nginx Debug Menu${NC}"
    echo "1. Test nginx configuration"
    echo "2. Test service connectivity"
    echo "3. Test nginx routes"
    echo "4. Test API endpoints"
    echo "5. Show nginx logs"
    echo "6. Show service status"
    echo "7. Restart nginx"
    echo "8. Run all tests"
    echo "9. Exit"
    echo ""
}

# Run all tests
run_all_tests() {
    test_nginx_config
    test_service_connectivity
    test_nginx_routes
    test_api_endpoints
    show_service_status
}

# Main script
main() {
    print_header "Asset Management Nginx Debug Tool"
    
    if [ "$1" = "--all" ]; then
        run_all_tests
        exit 0
    fi
    
    while true; do
        show_menu
        read -p "Choose an option (1-9): " choice
        
        case $choice in
            1) test_nginx_config ;;
            2) test_service_connectivity ;;
            3) test_nginx_routes ;;
            4) test_api_endpoints ;;
            5) show_nginx_logs ;;
            6) show_service_status ;;
            7) restart_nginx ;;
            8) run_all_tests ;;
            9) echo "Goodbye!"; exit 0 ;;
            *) print_error "Invalid option. Please choose 1-9." ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

main "$@"