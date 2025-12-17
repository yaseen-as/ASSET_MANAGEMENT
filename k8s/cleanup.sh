#!/bin/bash

###############################################################################
# Kubernetes Cleanup Script for Asset Management Software MVP
# This script removes all resources from the Kubernetes cluster
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

NAMESPACE="asset-management"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Asset Management K8s Cleanup Script${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "${RED}WARNING: This will delete all resources in namespace '$NAMESPACE'${NC}"
read -p "Are you sure? (yes/no): " -r
if [[ ! $REPLY == "yes" ]]; then
    echo -e "${GREEN}Cleanup cancelled${NC}"
    exit 0
fi

echo -e "\n${YELLOW}Deleting all resources...${NC}"

# Delete ingress first
kubectl delete ingress --all -n $NAMESPACE 2>/dev/null || true

# Delete services
kubectl delete svc --all -n $NAMESPACE 2>/dev/null || true

# Delete deployments and statefulsets
kubectl delete deployment --all -n $NAMESPACE 2>/dev/null || true
kubectl delete statefulset --all -n $NAMESPACE 2>/dev/null || true

# Delete HPA
kubectl delete hpa --all -n $NAMESPACE 2>/dev/null || true

# Delete PVCs
kubectl delete pvc --all -n $NAMESPACE 2>/dev/null || true

# Delete configmaps and secrets
kubectl delete configmap --all -n $NAMESPACE 2>/dev/null || true
kubectl delete secret --all -n $NAMESPACE 2>/dev/null || true

# Delete namespace
kubectl delete namespace $NAMESPACE 2>/dev/null || true

echo -e "${GREEN}✓ Cleanup complete${NC}"
