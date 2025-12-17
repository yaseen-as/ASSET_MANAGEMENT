#!/bin/bash

###############################################################################
# Wazuh SOC Deployment Script for Kubernetes
# Deploys complete Wazuh security monitoring stack
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Wazuh SOC Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to check prerequisites
check_prerequisites() {
    echo -e "\n${YELLOW}Checking prerequisites...${NC}"
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}kubectl not found. Please install kubectl.${NC}"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}Cannot connect to Kubernetes cluster.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Prerequisites check passed${NC}"
}

# Function to create namespace
create_namespace() {
    echo -e "\n${YELLOW}Creating Wazuh namespace...${NC}"
    kubectl apply -f k8s/security/wazuh-namespace.yaml
    echo -e "${GREEN}✓ Namespace created${NC}"
}

# Function to create secrets
create_secrets() {
    echo -e "\n${YELLOW}Creating Wazuh secrets...${NC}"
    echo -e "${YELLOW}⚠️  WARNING: Update passwords in k8s/security/wazuh-secrets.yaml before production deployment!${NC}"
    read -p "Have you updated the secrets? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Please update k8s/security/wazuh-secrets.yaml and run again.${NC}"
        exit 1
    fi
    
    kubectl apply -f k8s/security/wazuh-secrets.yaml
    echo -e "${GREEN}✓ Secrets created${NC}"
}

# Function to deploy Wazuh Indexer
deploy_indexer() {
    echo -e "\n${YELLOW}Deploying Wazuh Indexer (Elasticsearch)...${NC}"
    kubectl apply -f k8s/security/wazuh-indexer.yaml
    
    echo -e "${YELLOW}Waiting for Wazuh Indexer to be ready...${NC}"
    kubectl wait --for=condition=ready pod -l app=wazuh-indexer -n wazuh --timeout=600s
    
    echo -e "${GREEN}✓ Wazuh Indexer deployed${NC}"
}

# Function to deploy Wazuh Manager
deploy_manager() {
    echo -e "\n${YELLOW}Deploying Wazuh Manager...${NC}"
    kubectl apply -f k8s/security/wazuh-manager.yaml
    
    echo -e "${YELLOW}Waiting for Wazuh Manager to be ready...${NC}"
    kubectl wait --for=condition=ready pod -l app=wazuh-manager -n wazuh --timeout=600s
    
    echo -e "${GREEN}✓ Wazuh Manager deployed${NC}"
}

# Function to deploy Wazuh Dashboard
deploy_dashboard() {
    echo -e "\n${YELLOW}Deploying Wazuh Dashboard...${NC}"
    kubectl apply -f k8s/security/wazuh-dashboard.yaml
    
    echo -e "${YELLOW}Waiting for Wazuh Dashboard to be ready...${NC}"
    kubectl wait --for=condition=available deployment/wazuh-dashboard -n wazuh --timeout=600s
    
    echo -e "${GREEN}✓ Wazuh Dashboard deployed${NC}"
}

# Function to deploy Wazuh Agents
deploy_agents() {
    echo -e "\n${YELLOW}Deploying Wazuh Agents to application namespace...${NC}"
    kubectl apply -f k8s/security/wazuh-agent.yaml
    
    echo -e "${YELLOW}Waiting for Wazuh Agents to be ready...${NC}"
    sleep 30
    
    echo -e "${GREEN}✓ Wazuh Agents deployed${NC}"
}

# Function to configure custom rules
configure_custom_rules() {
    echo -e "\n${YELLOW}Configuring custom Wazuh rules for Asset Management...${NC}"
    
    # Create custom rules configmap
    kubectl create configmap wazuh-custom-rules -n wazuh \
        --from-file=wazuh/config/custom_rules.xml \
        --dry-run=client -o yaml | kubectl apply -f -
    
    echo -e "${GREEN}✓ Custom rules configured${NC}"
}

# Function to show access information
show_access_info() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}Wazuh SOC Access Information${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    # Get dashboard URL
    DASHBOARD_IP=$(kubectl get ingress wazuh-dashboard-ingress -n wazuh -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    
    if [ -z "$DASHBOARD_IP" ]; then
        echo -e "${YELLOW}Waiting for Ingress IP... Use port-forward instead:${NC}"
        echo -e "  kubectl port-forward -n wazuh svc/wazuh-dashboard 5601:443"
        echo -e "  Access: https://localhost:5601"
    else
        echo -e "${GREEN}Dashboard URL: https://$DASHBOARD_IP${NC}"
        echo -e "\n${YELLOW}Add to /etc/hosts:${NC}"
        echo -e "  $DASHBOARD_IP  wazuh.asset-management.local"
    fi
    
    echo -e "\n${YELLOW}Default Credentials:${NC}"
    echo -e "  Username: admin"
    echo -e "  Password: (check k8s/security/wazuh-secrets.yaml)"
    
    echo -e "\n${YELLOW}Wazuh Manager API:${NC}"
    echo -e "  kubectl port-forward -n wazuh svc/wazuh 55000:55000"
    echo -e "  API URL: https://localhost:55000"
    
    echo -e "\n${YELLOW}View Wazuh Resources:${NC}"
    echo -e "  kubectl get all -n wazuh"
    echo -e "  kubectl logs -f statefulset/wazuh-manager -n wazuh"
    echo -e "  kubectl logs -f statefulset/wazuh-indexer -n wazuh"
}

# Function to show monitoring status
show_monitoring_status() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}Monitoring Status${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    echo -e "\n${YELLOW}Wazuh Pods:${NC}"
    kubectl get pods -n wazuh
    
    echo -e "\n${YELLOW}Wazuh Agents:${NC}"
    kubectl get pods -n asset-management -l app=wazuh-agent
    
    echo -e "\n${YELLOW}Registered Agents (run after agents connect):${NC}"
    echo -e "  kubectl exec -n wazuh statefulset/wazuh-manager -- /var/ossec/bin/agent_control -l"
}

# Main deployment function
main() {
    check_prerequisites
    create_namespace
    create_secrets
    deploy_indexer
    deploy_manager
    deploy_dashboard
    deploy_agents
    
    echo -e "\n${YELLOW}Waiting for all components to stabilize...${NC}"
    sleep 15
    
    show_monitoring_status
    show_access_info
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Wazuh SOC Deployment Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo -e "  1. Access the Wazuh Dashboard"
    echo -e "  2. Configure alert notifications"
    echo -e "  3. Review security events"
    echo -e "  4. Set up compliance monitoring"
    echo -e "  5. Configure custom rules for your application"
}

# Run deployment
main
