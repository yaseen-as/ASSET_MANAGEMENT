#!/bin/bash

###############################################################################
# Docker Image Build and Push Script for Kubernetes Deployment
# Builds all service images and pushes them to Docker registry
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration - Change these to your Docker registry
DOCKER_REGISTRY="yaseen-as"  # Change to your Docker Hub username or registry URL
VERSION="${1:-latest}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Building Docker Images${NC}"
echo -e "${GREEN}========================================${NC}"

# Build Auth Service
echo -e "\n${YELLOW}Building Auth Service...${NC}"
docker build -t $DOCKER_REGISTRY/asset-management-auth:$VERSION \
  -f services/auth/Dockerfile services/auth
echo -e "${GREEN}✓ Auth service built${NC}"

# Build Portfolio Service
echo -e "\n${YELLOW}Building Portfolio Service...${NC}"
docker build -t $DOCKER_REGISTRY/asset-management-portfolio:$VERSION \
  -f services/portfolio/Dockerfile services/portfolio
echo -e "${GREEN}✓ Portfolio service built${NC}"

# Build Market Service
echo -e "\n${YELLOW}Building Market Service...${NC}"
docker build -t $DOCKER_REGISTRY/asset-management-market:$VERSION \
  -f services/market-data/Dockerfile services/market-data
echo -e "${GREEN}✓ Market service built${NC}"

# Build Frontend
echo -e "\n${YELLOW}Building Frontend...${NC}"
docker build -t $DOCKER_REGISTRY/asset-management-frontend:$VERSION \
  -f frontend/Dockerfile frontend
echo -e "${GREEN}✓ Frontend built${NC}"

# Push images
echo -e "\n${YELLOW}Do you want to push images to registry? (y/n)${NC}"
read -p "> " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}Pushing images to $DOCKER_REGISTRY...${NC}"
    
    docker push $DOCKER_REGISTRY/asset-management-auth:$VERSION
    docker push $DOCKER_REGISTRY/asset-management-portfolio:$VERSION
    docker push $DOCKER_REGISTRY/asset-management-market:$VERSION
    docker push $DOCKER_REGISTRY/asset-management-frontend:$VERSION
    
    echo -e "${GREEN}✓ All images pushed${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Build Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nBuilt images:"
echo "  $DOCKER_REGISTRY/asset-management-auth:$VERSION"
echo "  $DOCKER_REGISTRY/asset-management-portfolio:$VERSION"
echo "  $DOCKER_REGISTRY/asset-management-market:$VERSION"
echo "  $DOCKER_REGISTRY/asset-management-frontend:$VERSION"
