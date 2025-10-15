#!/bin/bash

# Advanced Asset Management System Deployment Script
# Event-Driven Architecture with AI/ML Infrastructure

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="asset-management-advanced"
COMPOSE_FILE="infrastructure/docker-compose.advanced.yml"
ENV_FILE=".env.advanced"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create environment file if it doesn't exist
create_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_status "Creating environment file..."
        cat > "$ENV_FILE" << EOF
# Database Configuration
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
CLICKHOUSE_USER=admin
CLICKHOUSE_PASSWORD=admin123

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Angel One API Configuration
ANGEL_ONE_API_KEY=your-angel-one-api-key
ANGEL_ONE_CLIENT_ID=your-angel-one-client-id

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Service URLs
AUTH_SERVICE_URL=http://auth-service-v2:3001
PORTFOLIO_SERVICE_URL=http://portfolio-service-v2:3002
MARKET_SERVICE_URL=http://market-data-service-v2:3003
AI_SERVICE_URL=http://ai-insights-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# Kafka Configuration
KAFKA_BROKERS=kafka:9092

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Monitoring
LOG_LEVEL=info
EOF
        print_success "Environment file created: $ENV_FILE"
        print_warning "Please update the API keys and secrets in $ENV_FILE"
    else
        print_status "Environment file already exists: $ENV_FILE"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=(
        "infrastructure/init-scripts"
        "infrastructure/clickhouse"
        "ml-models/portfolio_predictor"
        "mlflow"
        "services/api-gateway/logs"
        "services/auth-v2/logs"
        "services/portfolio-v2/logs"
        "services/market-data-v2/logs"
        "services/ai-insights/logs"
        "services/notification/logs"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    done
}

# Initialize shared library
setup_shared_library() {
    print_status "Setting up shared library..."
    cd shared
    npm install
    npm run build
    cd ..
    print_success "Shared library built successfully"
}

# Build services
build_services() {
    print_status "Building services..."
    
    # Stop existing containers
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    
    # Build new images
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
    
    print_success "Services built successfully"
}

# Deploy infrastructure (Kafka, Redis, Databases)
deploy_infrastructure() {
    print_status "Deploying infrastructure..."
    
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d \
        zookeeper \
        kafka \
        schema-registry \
        kafka-ui \
        redis \
        postgres-cluster \
        clickhouse \
        elasticsearch
    
    # Wait for services to be ready
    print_status "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Check service health
    check_service_health "kafka" "9092"
    check_service_health "redis" "6379"
    check_service_health "postgres" "5432"
    check_service_health "clickhouse" "8123"
    check_service_health "elasticsearch" "9200"
    
    print_success "Infrastructure deployed successfully"
}

# Deploy ML infrastructure
deploy_ml_infrastructure() {
    print_status "Deploying ML infrastructure..."
    
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d \
        tensorflow-serving \
        mlflow
    
    print_success "ML infrastructure deployed successfully"
}

# Deploy application services
deploy_application_services() {
    print_status "Deploying application services..."
    
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d \
        api-gateway \
        auth-service-v2 \
        portfolio-service-v2 \
        market-data-service-v2 \
        ai-insights-service \
        notification-service
    
    print_success "Application services deployed successfully"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d \
        frontend-v2
    
    print_success "Frontend deployed successfully"
}

# Deploy monitoring
deploy_monitoring() {
    print_status "Deploying monitoring stack..."
    
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d \
        prometheus \
        grafana \
        jaeger
    
    print_success "Monitoring stack deployed successfully"
}

# Check service health
check_service_health() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Checking $service health on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            print_success "$service is healthy"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts: Waiting for $service..."
        sleep 2
        ((attempt++))
    done
    
    print_error "$service health check failed"
    return 1
}

# Setup database schemas
setup_databases() {
    print_status "Setting up database schemas..."
    
    # Wait for PostgreSQL to be ready
    sleep 10
    
    # Create databases for each service
    docker exec postgres-cluster psql -U admin -d asset_management -c "
        CREATE DATABASE IF NOT EXISTS auth_v2;
        CREATE DATABASE IF NOT EXISTS portfolio_v2;
        CREATE DATABASE IF NOT EXISTS market_data_v2;
        CREATE DATABASE IF NOT EXISTS ai_insights;
        CREATE DATABASE IF NOT EXISTS notifications;
        CREATE DATABASE IF NOT EXISTS mlflow;
    " || true
    
    print_success "Database schemas created"
}

# Initialize Kafka topics
setup_kafka_topics() {
    print_status "Setting up Kafka topics..."
    
    topics=(
        "domain-events"
        "domain-commands"
        "dead-letter-queue"
        "user-events"
        "portfolio-events"
        "market-events"
        "ai-events"
        "notification-events"
    )
    
    for topic in "${topics[@]}"; do
        docker exec kafka kafka-topics --create \
            --bootstrap-server localhost:9092 \
            --topic "$topic" \
            --partitions 3 \
            --replication-factor 1 \
            --if-not-exists || true
        print_status "Created topic: $topic"
    done
    
    print_success "Kafka topics created"
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    
    print_status "🏗️  Infrastructure Services:"
    echo "   • Kafka UI: http://localhost:8080"
    echo "   • PostgreSQL: localhost:5432"
    echo "   • ClickHouse: localhost:8123"
    echo "   • Redis: localhost:6379"
    echo "   • Elasticsearch: localhost:9200"
    echo ""
    
    print_status "🤖 ML Infrastructure:"
    echo "   • TensorFlow Serving: localhost:8501"
    echo "   • MLflow: http://localhost:5000"
    echo ""
    
    print_status "🚀 Application Services:"
    echo "   • API Gateway: http://localhost:3000"
    echo "   • Frontend: http://localhost:5173"
    echo ""
    
    print_status "📊 Monitoring:"
    echo "   • Prometheus: http://localhost:9090"
    echo "   • Grafana: http://localhost:3001 (admin/admin)"
    echo "   • Jaeger: http://localhost:16686"
    echo ""
    
    print_status "🐳 Docker Status:"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
}

# Main deployment function
main() {
    print_status "Starting Advanced Asset Management System deployment..."
    print_status "Architecture: Event-Driven Microservices with AI/ML"
    echo ""
    
    # Create environment and directories
    create_env_file
    create_directories
    
    # Setup shared library
    setup_shared_library
    
    # Build all services
    build_services
    
    # Deploy in phases
    print_status "Phase 1: Infrastructure"
    deploy_infrastructure
    setup_databases
    setup_kafka_topics
    
    print_status "Phase 2: ML Infrastructure"
    deploy_ml_infrastructure
    
    print_status "Phase 3: Application Services"
    deploy_application_services
    
    print_status "Phase 4: Frontend"
    deploy_frontend
    
    print_status "Phase 5: Monitoring"
    deploy_monitoring
    
    # Wait for all services to be ready
    print_status "Waiting for all services to stabilize..."
    sleep 30
    
    # Show final status
    show_status
    
    print_success "🎉 Advanced Asset Management System deployed successfully!"
    print_status "Next steps:"
    echo "   1. Update API keys in $ENV_FILE"
    echo "   2. Access the application at http://localhost:5173"
    echo "   3. Monitor services via the provided dashboards"
}

# Handle script arguments
case "${1:-}" in
    "infrastructure")
        deploy_infrastructure
        ;;
    "ml")
        deploy_ml_infrastructure
        ;;
    "services")
        deploy_application_services
        ;;
    "frontend")
        deploy_frontend
        ;;
    "monitoring")
        deploy_monitoring
        ;;
    "status")
        show_status
        ;;
    "clean")
        print_warning "Stopping and removing all containers..."
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v
        docker system prune -f
        print_success "Cleanup completed"
        ;;
    *)
        main
        ;;
esac
