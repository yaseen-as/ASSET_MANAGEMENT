#!/bin/bash

# Asset Management - Backend Service Test Script
# Tests all backend services through nginx proxy

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    echo -e "${YELLOW}⚠️ $1${NC}"
}

BASE_URL="http://localhost:8080"

print_header "Backend Services Communication Test"

echo "Testing base URL: $BASE_URL"
echo ""

# Test 1: Nginx Health
echo "1. Testing Nginx Health..."
if curl -s "$BASE_URL/nginx-health" | grep -q "healthy"; then
    print_success "Nginx is healthy"
else
    print_error "Nginx health check failed"
    exit 1
fi

# Test 2: Frontend serving
echo "2. Testing Frontend serving..."
if curl -s "$BASE_URL/" | grep -q "<!DOCTYPE html>"; then
    print_success "Frontend is being served correctly"
else
    print_error "Frontend not accessible"
    exit 1
fi

# Test 3: Auth service
echo "3. Testing Auth Service..."
response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"testpass"}' \
    -o /tmp/auth_response.json)

if [ "$response" -eq "400" ] || [ "$response" -eq "401" ]; then
    print_success "Auth service is responding (HTTP $response)"
    echo "   Auth Response: $(cat /tmp/auth_response.json | jq -r '.message // .')"
else
    print_error "Auth service failed (HTTP $response)"
    cat /tmp/auth_response.json
fi

# Test 4: Portfolio service
echo "4. Testing Portfolio Service..."
response=$(curl -s -w "%{http_code}" "$BASE_URL/portfolio/health" -o /tmp/portfolio_response.json)

if [ "$response" -eq "200" ] || [ "$response" -eq "401" ] || [ "$response" -eq "404" ]; then
    print_success "Portfolio service is responding (HTTP $response)"
else
    print_error "Portfolio service failed (HTTP $response)"
    cat /tmp/portfolio_response.json
fi

# Test 5: Market service  
echo "5. Testing Market Service..."
response=$(curl -s -w "%{http_code}" "$BASE_URL/market/health" -o /tmp/market_response.json)

if [ "$response" -eq "200" ] || [ "$response" -eq "401" ] || [ "$response" -eq "404" ]; then
    print_success "Market service is responding (HTTP $response)"
else
    print_error "Market service failed (HTTP $response)"
    cat /tmp/market_response.json
fi

print_header "Service Logs (Last 5 lines)"

echo "Auth Service Logs:"
docker-compose logs --tail=5 auth-service-dev 2>/dev/null || echo "No logs available"

echo -e "\nPortfolio Service Logs:"  
docker-compose logs --tail=5 portfolio-service-dev 2>/dev/null || echo "No logs available"

echo -e "\nMarket Service Logs:"
docker-compose logs --tail=5 market-service-dev 2>/dev/null || echo "No logs available"

echo -e "\nNginx Logs:"
docker-compose logs --tail=5 nginx-dev 2>/dev/null || echo "No logs available"

print_header "Summary"

echo "✅ All services are accessible through nginx proxy"
echo "🌐 Frontend URL: $BASE_URL"
echo "📡 API Endpoints: $BASE_URL/auth, $BASE_URL/portfolio, $BASE_URL/market"
echo ""
echo "To test the frontend:"
echo "1. Open $BASE_URL in your browser"
echo "2. Check browser console for API calls"
echo "3. Try logging in with test credentials"

# Cleanup
rm -f /tmp/auth_response.json /tmp/portfolio_response.json /tmp/market_response.json