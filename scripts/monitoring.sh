#!/bin/bash

# Asset Management Monitoring Stack Manager
# This script helps manage the comprehensive monitoring, streaming, and security infrastructure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Check if Docker and Docker Compose are installed
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed ✓"
}

# Create necessary directories
setup_directories() {
    print_header "Setting up Directories"
    
    local dirs=(
        "$PROJECT_ROOT/monitoring/prometheus/data"
        "$PROJECT_ROOT/monitoring/grafana/data"
        "$PROJECT_ROOT/monitoring/grafana/logs"
        "$PROJECT_ROOT/monitoring/alertmanager/data"
        "$PROJECT_ROOT/monitoring/wazuh/wazuh_api_configuration"
        "$PROJECT_ROOT/monitoring/wazuh/wazuh_etc"
        "$PROJECT_ROOT/monitoring/wazuh/wazuh_logs"
        "$PROJECT_ROOT/monitoring/wazuh/wazuh_queue"
        "$PROJECT_ROOT/monitoring/wazuh/wazuh_var_multigroups"
        "$PROJECT_ROOT/monitoring/wazuh/wazuh_integrations"
        "$PROJECT_ROOT/monitoring/wazuh/wazuh_active_response"
        "$PROJECT_ROOT/monitoring/wazuh/wazuh_agentless"
        "$PROJECT_ROOT/monitoring/wazuh/wazuh_wodles"
        "$PROJECT_ROOT/monitoring/wazuh/filebeat_etc"
        "$PROJECT_ROOT/monitoring/wazuh/filebeat_var"
        "$PROJECT_ROOT/data/redis"
        "$PROJECT_ROOT/data/kafka"
        "$PROJECT_ROOT/data/zookeeper"
    )
    
    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    done
    
    # Set proper permissions for monitoring directories
    sudo chown -R 472:472 "$PROJECT_ROOT/monitoring/grafana/data" "$PROJECT_ROOT/monitoring/grafana/logs" || true
    sudo chown -R 65534:65534 "$PROJECT_ROOT/monitoring/prometheus/data" || true
    
    print_status "Directories setup completed ✓"
}

# Deploy monitoring stack
deploy_monitoring() {
    print_header "Deploying Monitoring Stack"
    
    cd "$PROJECT_ROOT"
    
    # Start the monitoring services
    docker-compose --profile monitoring up -d prometheus grafana alertmanager node-exporter
    
    print_status "Monitoring services started successfully ✓"
    print_status "Grafana: http://localhost:3001 (admin/admin)"
    print_status "Prometheus: http://localhost:9090"
    print_status "AlertManager: http://localhost:9093"
}

# Deploy streaming infrastructure
deploy_streaming() {
    print_header "Deploying Streaming Infrastructure"
    
    cd "$PROJECT_ROOT"
    
    # Start Redis and Kafka services
    docker-compose --profile streaming up -d redis kafka zookeeper
    
    print_status "Streaming services started successfully ✓"
    print_status "Redis: localhost:6379"
    print_status "Kafka: localhost:9092"
}

# Deploy security monitoring
deploy_security() {
    print_header "Deploying Security Monitoring (Wazuh)"
    
    cd "$PROJECT_ROOT"
    
    # Start Wazuh services
    docker-compose --profile security up -d wazuh-manager wazuh-indexer wazuh-dashboard
    
    print_status "Security monitoring services started successfully ✓"
    print_status "Wazuh Dashboard: https://localhost:443 (admin/SecretPassword)"
    print_warning "Please wait 2-3 minutes for Wazuh to fully initialize"
}

# Deploy application services
deploy_app() {
    print_header "Deploying Application Services"
    
    cd "$PROJECT_ROOT"
    
    # Start application services
    docker-compose up -d auth-service portfolio-service market-data-service frontend nginx
    
    print_status "Application services started successfully ✓"
    print_status "Frontend: http://localhost"
    print_status "Auth Service: http://localhost/auth"
    print_status "Portfolio Service: http://localhost/portfolio"
    print_status "Market Data Service: http://localhost/market"
}

# Deploy everything
deploy_all() {
    print_header "Deploying Complete Asset Management Stack"
    
    setup_directories
    
    cd "$PROJECT_ROOT"
    
    # Deploy in order: databases, then monitoring, then streaming, then security, then application
    docker-compose up -d postgres-auth postgres-portfolio postgres-market
    print_status "Databases started ✓"
    
    sleep 10
    
    deploy_monitoring
    deploy_streaming
    deploy_app
    deploy_security
    
    print_header "Deployment Summary"
    print_status "🚀 Asset Management Platform: http://localhost"
    print_status "📊 Grafana (Monitoring): http://localhost:3001"
    print_status "🔍 Prometheus (Metrics): http://localhost:9090"
    print_status "🚨 AlertManager (Alerts): http://localhost:9093"
    print_status "🛡️ Wazuh Security: https://localhost:443"
    print_status "📈 Redis Commander: http://localhost:8081"
    print_warning "Please wait 3-5 minutes for all services to fully initialize"
}

# Stop all services
stop_all() {
    print_header "Stopping All Services"
    
    cd "$PROJECT_ROOT"
    docker-compose down
    
    print_status "All services stopped ✓"
}

# Show service status
show_status() {
    print_header "Service Status"
    
    cd "$PROJECT_ROOT"
    docker-compose ps
}

# Show service logs
show_logs() {
    local service="$1"
    
    if [ -z "$service" ]; then
        print_header "All Service Logs"
        docker-compose logs -f --tail=100
    else
        print_header "Logs for $service"
        docker-compose logs -f --tail=100 "$service"
    fi
}

# Health check
health_check() {
    print_header "Health Check"
    
    local services=(
        "http://localhost:3001/auth/health:Auth Service"
        "http://localhost:3002/portfolio/health:Portfolio Service"
        "http://localhost:3003/market/health:Market Data Service"
        "http://localhost:3001:Grafana"
        "http://localhost:9090:Prometheus"
        "http://localhost:9093:AlertManager"
    )
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r url name <<< "$service_info"
        
        if curl -s "$url" > /dev/null 2>&1; then
            print_status "$name is healthy ✓"
        else
            print_error "$name is not responding ✗"
        fi
    done
}

# Update monitoring configuration
update_config() {
    print_header "Updating Monitoring Configuration"
    
    cd "$PROJECT_ROOT"
    
    # Reload Prometheus configuration
    if docker-compose ps prometheus | grep -q "Up"; then
        docker-compose exec prometheus kill -HUP 1
        print_status "Prometheus configuration reloaded ✓"
    fi
    
    # Restart Grafana to pick up dashboard changes
    if docker-compose ps grafana | grep -q "Up"; then
        docker-compose restart grafana
        print_status "Grafana restarted ✓"
    fi
}

# Backup monitoring data
backup_data() {
    print_header "Backing up Monitoring Data"
    
    local backup_dir="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup Grafana data
    if [ -d "$PROJECT_ROOT/monitoring/grafana/data" ]; then
        cp -r "$PROJECT_ROOT/monitoring/grafana/data" "$backup_dir/grafana"
        print_status "Grafana data backed up ✓"
    fi
    
    # Backup Prometheus data
    if [ -d "$PROJECT_ROOT/monitoring/prometheus/data" ]; then
        cp -r "$PROJECT_ROOT/monitoring/prometheus/data" "$backup_dir/prometheus"
        print_status "Prometheus data backed up ✓"
    fi
    
    print_status "Backup completed: $backup_dir"
}

# Show help
show_help() {
    echo "Asset Management Monitoring Stack Manager"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  deploy-all          Deploy complete stack (recommended for first time)"
    echo "  deploy-monitoring   Deploy monitoring services only (Prometheus, Grafana, AlertManager)"
    echo "  deploy-streaming    Deploy streaming infrastructure (Redis, Kafka)"
    echo "  deploy-security     Deploy security monitoring (Wazuh)"
    echo "  deploy-app          Deploy application services"
    echo "  stop               Stop all services"
    echo "  status             Show service status"
    echo "  logs [service]     Show logs (all services or specific service)"
    echo "  health             Perform health check"
    echo "  update-config      Update and reload monitoring configuration"
    echo "  backup             Backup monitoring data"
    echo "  setup              Setup directories only"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy-all                    # Deploy everything"
    echo "  $0 deploy-monitoring            # Deploy only monitoring"
    echo "  $0 logs grafana                 # Show Grafana logs"
    echo "  $0 health                       # Check service health"
}

# Main script logic
main() {
    case "${1:-help}" in
        "deploy-all")
            check_prerequisites
            deploy_all
            ;;
        "deploy-monitoring")
            check_prerequisites
            setup_directories
            deploy_monitoring
            ;;
        "deploy-streaming")
            check_prerequisites
            setup_directories
            deploy_streaming
            ;;
        "deploy-security")
            check_prerequisites
            setup_directories
            deploy_security
            ;;
        "deploy-app")
            check_prerequisites
            deploy_app
            ;;
        "stop")
            stop_all
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "health")
            health_check
            ;;
        "update-config")
            update_config
            ;;
        "backup")
            backup_data
            ;;
        "setup")
            setup_directories
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

main "$@"