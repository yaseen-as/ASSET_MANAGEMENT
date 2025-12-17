#!/bin/bash

###############################################################################
# Wazuh Quick Start Script for Docker Compose
# Use this for local testing before Kubernetes deployment
###############################################################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Wazuh SOC Quick Start (Docker Compose)${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Start Wazuh stack
echo -e "\n${YELLOW}Starting Wazuh SOC stack...${NC}"
docker-compose -f docker-compose.wazuh.yml up -d

# Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to start (this may take 2-3 minutes)...${NC}"
sleep 120

# Check service status
echo -e "\n${GREEN}Service Status:${NC}"
docker-compose -f docker-compose.wazuh.yml ps

# Display access information
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Wazuh SOC is Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Access Information:${NC}"
echo -e "  Dashboard: https://localhost:5601"
echo -e "  API: https://localhost:55000"
echo -e "\n${YELLOW}Default Credentials:${NC}"
echo -e "  Username: admin"
echo -e "  Password: SecurePassword123!"
echo -e "\n${YELLOW}View Logs:${NC}"
echo -e "  docker-compose -f docker-compose.wazuh.yml logs -f wazuh-manager"
echo -e "\n${YELLOW}Stop Wazuh:${NC}"
echo -e "  docker-compose -f docker-compose.wazuh.yml down"
echo -e "\n${GREEN}========================================${NC}"
