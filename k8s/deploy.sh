#!/bin/bash

###############################################################################
# Kubernetes Deployment Script for Asset Management Software MVP
# This script deploys the entire application to a Kubernetes cluster
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="asset-management"
K8S_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/k8s"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Asset Management K8s Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to check if kubectl is installed
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}kubectl is not installed. Please install kubectl first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ kubectl is installed${NC}"
}

# Function to check cluster connection
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}Cannot connect to Kubernetes cluster. Please check your kubeconfig.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Connected to Kubernetes cluster${NC}"
    kubectl cluster-info
}

# Function to create namespace
create_namespace() {
    echo -e "\n${YELLOW}Creating namespace...${NC}"
    kubectl apply -f "$K8S_DIR/namespace.yaml"
    echo -e "${GREEN}✓ Namespace created${NC}"
}

# Function to create secrets
create_secrets() {
    echo -e "\n${YELLOW}Creating secrets...${NC}"
    echo -e "${YELLOW}⚠️  WARNING: Update secrets.yaml with production values before deploying!${NC}"
    read -p "Have you updated the secrets? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Please update k8s/secrets.yaml with production values and run again.${NC}"
        exit 1
    fi
    kubectl apply -f "$K8S_DIR/secrets.yaml"
    echo -e "${GREEN}✓ Secrets created${NC}"
}

# Function to create configmaps
create_configmaps() {
    echo -e "\n${YELLOW}Creating ConfigMaps...${NC}"
    kubectl apply -f "$K8S_DIR/configmap.yaml"
    echo -e "${GREEN}✓ ConfigMaps created${NC}"
}

# Function to deploy databases
deploy_databases() {
    echo -e "\n${YELLOW}Deploying PostgreSQL databases...${NC}"
    kubectl apply -f "$K8S_DIR/databases/postgres-auth.yaml"
    kubectl apply -f "$K8S_DIR/databases/postgres-portfolio.yaml"
    kubectl apply -f "$K8S_DIR/databases/postgres-market.yaml"
    
    echo -e "${YELLOW}Waiting for databases to be ready...${NC}"
    kubectl wait --for=condition=ready pod -l app=postgres-auth -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=postgres-portfolio -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=postgres-market -n $NAMESPACE --timeout=300s
    
    echo -e "${GREEN}✓ Databases deployed and ready${NC}"
}

# Function to deploy backend services
deploy_backend() {
    echo -e "\n${YELLOW}Deploying backend services...${NC}"
    kubectl apply -f "$K8S_DIR/services/auth-service.yaml"
    kubectl apply -f "$K8S_DIR/services/portfolio-service.yaml"
    kubectl apply -f "$K8S_DIR/services/market-service.yaml"
    
    echo -e "${YELLOW}Waiting for backend services to be ready...${NC}"
    kubectl wait --for=condition=available deployment/auth-service -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=available deployment/portfolio-service -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=available deployment/market-service -n $NAMESPACE --timeout=300s
    
    echo -e "${GREEN}✓ Backend services deployed and ready${NC}"
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "\n${YELLOW}Deploying frontend...${NC}"
    kubectl apply -f "$K8S_DIR/services/frontend.yaml"
    
    echo -e "${YELLOW}Waiting for frontend to be ready...${NC}"
    kubectl wait --for=condition=available deployment/frontend -n $NAMESPACE --timeout=300s
    
    echo -e "${GREEN}✓ Frontend deployed and ready${NC}"
}

# Function to setup ingress
setup_ingress() {
    echo -e "\n${YELLOW}Setting up Ingress...${NC}"
    
    # Check if nginx-ingress is installed
    if ! kubectl get ingressclass nginx &> /dev/null; then
        echo -e "${YELLOW}Nginx Ingress Controller not found. Installing...${NC}"
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
        echo -e "${YELLOW}Waiting for ingress controller to be ready...${NC}"
        kubectl wait --namespace ingress-nginx \
          --for=condition=ready pod \
          --selector=app.kubernetes.io/component=controller \
          --timeout=120s
    fi
    
    # Apply ingress configuration
    kubectl apply -f "$K8S_DIR/ingress.yaml"
    
    echo -e "${GREEN}✓ Ingress configured${NC}"
}

# Function to setup cert-manager (optional)
setup_cert_manager() {
    echo -e "\n${YELLOW}Do you want to install cert-manager for SSL certificates? (y/n)${NC}"
    read -p "> " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
        echo -e "${YELLOW}Waiting for cert-manager to be ready...${NC}"
        kubectl wait --for=condition=available deployment/cert-manager -n cert-manager --timeout=300s
        
        # Apply cluster issuer
        kubectl apply -f "$K8S_DIR/cert-issuer.yaml"
        echo -e "${GREEN}✓ Cert-manager installed${NC}"
    fi
}

# Function to display deployment status
show_status() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment Status${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    echo -e "\n${YELLOW}Pods:${NC}"
    kubectl get pods -n $NAMESPACE
    
    echo -e "\n${YELLOW}Services:${NC}"
    kubectl get services -n $NAMESPACE
    
    echo -e "\n${YELLOW}Ingress:${NC}"
    kubectl get ingress -n $NAMESPACE
    
    echo -e "\n${YELLOW}HPA:${NC}"
    kubectl get hpa -n $NAMESPACE
}

# Function to get access information
show_access_info() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}Access Information${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    INGRESS_IP=$(kubectl get ingress asset-management-ingress-simple -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$INGRESS_IP" ]; then
        echo -e "${YELLOW}Waiting for Ingress IP...${NC}"
        echo -e "${YELLOW}Run this command to get the IP:${NC}"
        echo "kubectl get ingress -n $NAMESPACE"
    else
        echo -e "${GREEN}Application is accessible at:${NC}"
        echo -e "  http://$INGRESS_IP"
        echo -e "\n${YELLOW}Add this to your /etc/hosts:${NC}"
        echo -e "  $INGRESS_IP  asset-management.local"
    fi
    
    echo -e "\n${YELLOW}Useful commands:${NC}"
    echo "  kubectl get all -n $NAMESPACE"
    echo "  kubectl logs -f deployment/auth-service -n $NAMESPACE"
    echo "  kubectl describe pod <pod-name> -n $NAMESPACE"
    echo "  kubectl exec -it <pod-name> -n $NAMESPACE -- /bin/sh"
}

# Main deployment flow
main() {
    check_kubectl
    check_cluster
    
    echo -e "\n${YELLOW}Starting deployment...${NC}"
    
    create_namespace
    create_secrets
    create_configmaps
    deploy_databases
    deploy_backend
    deploy_frontend
    setup_ingress
    setup_cert_manager
    
    echo -e "\n${YELLOW}Waiting for all deployments to stabilize...${NC}"
    sleep 10
    
    show_status
    show_access_info
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Deployment Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Run main deployment
main
