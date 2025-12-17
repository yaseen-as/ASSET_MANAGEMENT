# Kubernetes Deployment Guide

This directory contains Kubernetes manifests and deployment scripts for the Asset Management Software MVP.

## 📁 Directory Structure

```
k8s/
├── namespace.yaml              # Kubernetes namespace
├── configmap.yaml              # Application configuration
├── secrets.yaml                # Sensitive credentials
├── ingress.yaml                # Ingress routing rules
├── cert-issuer.yaml            # SSL certificate issuer (cert-manager)
├── databases/
│   ├── postgres-auth.yaml      # Auth database StatefulSet
│   ├── postgres-portfolio.yaml # Portfolio database StatefulSet
│   └── postgres-market.yaml    # Market database StatefulSet
├── services/
│   ├── auth-service.yaml       # Auth service deployment
│   ├── portfolio-service.yaml  # Portfolio service deployment
│   ├── market-service.yaml     # Market service deployment
│   └── frontend.yaml           # Frontend deployment
├── monitoring/                 # Monitoring stack (Prometheus, Grafana)
├── deploy.sh                   # Automated deployment script
├── cleanup.sh                  # Cleanup script
└── build-images.sh             # Docker image build script
```

## 🚀 Prerequisites

### Required Tools
- **kubectl** (v1.28+)
- **Docker** (for building images)
- **Kubernetes cluster** (Minikube, Kind, GKE, EKS, AKS, etc.)

### Install kubectl
```bash
# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# macOS
brew install kubectl

# Verify installation
kubectl version --client
```

### Setup Kubernetes Cluster

#### Option 1: Minikube (Local Development)
```bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start cluster
minikube start --cpus=4 --memory=8192

# Enable ingress addon
minikube addons enable ingress
```

#### Option 2: Kind (Kubernetes in Docker)
```bash
# Install Kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Create cluster
kind create cluster --name asset-management --config kind-config.yaml
```

#### Option 3: Cloud Providers
- **GKE (Google)**: `gcloud container clusters create asset-management`
- **EKS (AWS)**: `eksctl create cluster --name asset-management`
- **AKS (Azure)**: `az aks create --name asset-management`

## 🔧 Configuration

### 1. Update Secrets
Edit `k8s/secrets.yaml` with production values:

```yaml
# IMPORTANT: Never commit real secrets to version control!
stringData:
  JWT_SECRET: "your-production-jwt-secret-minimum-32-characters-long"
  JWT_REFRESH_SECRET: "your-production-refresh-secret"
  AUTH_DB_PASSWORD: "strong-database-password"
  ANGEL_ONE_CLIENT_ID: "your-angel-one-client-id"
  ANGEL_ONE_API_KEY: "your-angel-one-api-key"
```

### 2. Update ConfigMap
Edit `k8s/configmap.yaml` for your environment:

```yaml
data:
  VITE_REACT_APP_API_URL: "https://your-domain.com"
  CORS_ORIGIN: "https://your-domain.com"
```

### 3. Update Docker Registry
Edit `k8s/build-images.sh`:

```bash
DOCKER_REGISTRY="your-dockerhub-username"  # or your private registry
```

## 📦 Build and Push Docker Images

```bash
# Make scripts executable
chmod +x k8s/*.sh

# Build images (will tag as 'latest')
./k8s/build-images.sh

# Build with specific version
./k8s/build-images.sh v1.0.0

# Login to Docker Hub (if pushing)
docker login

# Script will prompt to push images
```

## 🚀 Deployment

### Automated Deployment (Recommended)

```bash
# Deploy everything automatically
./k8s/deploy.sh
```

The script will:
1. ✅ Check prerequisites (kubectl, cluster connection)
2. ✅ Create namespace
3. ✅ Apply secrets and configmaps
4. ✅ Deploy databases (StatefulSets)
5. ✅ Deploy backend services
6. ✅ Deploy frontend
7. ✅ Configure ingress
8. ✅ Optionally install cert-manager for SSL

### Manual Deployment

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create secrets and configmaps
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml

# 3. Deploy databases
kubectl apply -f k8s/databases/

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres-auth -n asset-management --timeout=300s

# 4. Deploy backend services
kubectl apply -f k8s/services/auth-service.yaml
kubectl apply -f k8s/services/portfolio-service.yaml
kubectl apply -f k8s/services/market-service.yaml

# 5. Deploy frontend
kubectl apply -f k8s/services/frontend.yaml

# 6. Setup ingress
kubectl apply -f k8s/ingress.yaml
```

## 🔍 Verification

### Check Deployment Status
```bash
# All resources
kubectl get all -n asset-management

# Pods
kubectl get pods -n asset-management

# Services
kubectl get svc -n asset-management

# Ingress
kubectl get ingress -n asset-management

# HPA (Horizontal Pod Autoscaler)
kubectl get hpa -n asset-management
```

### View Logs
```bash
# Auth service logs
kubectl logs -f deployment/auth-service -n asset-management

# Portfolio service logs
kubectl logs -f deployment/portfolio-service -n asset-management

# All pods
kubectl logs -f -l app=frontend -n asset-management
```

### Describe Resources
```bash
# Describe pod
kubectl describe pod <pod-name> -n asset-management

# Describe service
kubectl describe svc auth-service -n asset-management

# Describe ingress
kubectl describe ingress asset-management-ingress-simple -n asset-management
```

## 🌐 Accessing the Application

### Get Ingress IP
```bash
kubectl get ingress -n asset-management

# For LoadBalancer
INGRESS_IP=$(kubectl get ingress asset-management-ingress-simple -n asset-management -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo $INGRESS_IP
```

### Local Access (Minikube)
```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts
echo "$(minikube ip) asset-management.local" | sudo tee -a /etc/hosts

# Access application
open http://asset-management.local
```

### Production Access
1. Point your domain's DNS to the LoadBalancer IP
2. Access via your domain: https://your-domain.com

## 🔄 Updates and Rollouts

### Update Application
```bash
# Rebuild and push new image
./k8s/build-images.sh v1.1.0

# Update deployment
kubectl set image deployment/auth-service auth-service=yaseen-as/asset-management-auth:v1.1.0 -n asset-management

# Or apply updated YAML
kubectl apply -f k8s/services/auth-service.yaml
```

### Rolling Update
```bash
# Update with zero downtime
kubectl rollout status deployment/auth-service -n asset-management

# Rollback if needed
kubectl rollout undo deployment/auth-service -n asset-management

# View rollout history
kubectl rollout history deployment/auth-service -n asset-management
```

## 📊 Scaling

### Manual Scaling
```bash
# Scale frontend to 5 replicas
kubectl scale deployment frontend --replicas=5 -n asset-management

# Scale backend services
kubectl scale deployment auth-service --replicas=3 -n asset-management
```

### Auto-scaling (HPA)
The manifests include Horizontal Pod Autoscalers:
- **Frontend**: 3-20 replicas (70% CPU, 80% memory)
- **Backend Services**: 2-10 replicas (70% CPU, 80% memory)

```bash
# View HPA status
kubectl get hpa -n asset-management

# Watch auto-scaling
kubectl get hpa -n asset-management -w
```

## 🗄️ Database Management

### Run Prisma Migrations
```bash
# Get auth service pod name
AUTH_POD=$(kubectl get pod -l app=auth-service -n asset-management -o jsonpath='{.items[0].metadata.name}')

# Run migrations
kubectl exec -it $AUTH_POD -n asset-management -- npx prisma migrate deploy

# Or access database directly
kubectl exec -it postgres-auth-0 -n asset-management -- psql -U auth_user -d auth_db
```

### Backup Database
```bash
# Backup auth database
kubectl exec postgres-auth-0 -n asset-management -- pg_dump -U auth_user auth_db > auth_backup.sql

# Restore database
kubectl exec -i postgres-auth-0 -n asset-management -- psql -U auth_user auth_db < auth_backup.sql
```

## 🔒 SSL/TLS Configuration

### Install cert-manager
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager
kubectl wait --for=condition=available deployment/cert-manager -n cert-manager --timeout=300s

# Apply cluster issuer
kubectl apply -f k8s/cert-issuer.yaml
```

### Certificate will be automatically issued
The ingress configuration includes cert-manager annotations that will automatically request and renew SSL certificates.

## 🧹 Cleanup

### Remove All Resources
```bash
# Use cleanup script
./k8s/cleanup.sh

# Or manually
kubectl delete namespace asset-management
```

## 🐛 Troubleshooting

### Pod not starting
```bash
# Check pod events
kubectl describe pod <pod-name> -n asset-management

# Check logs
kubectl logs <pod-name> -n asset-management

# Check previous container logs (if crashed)
kubectl logs <pod-name> -n asset-management --previous
```

### Database connection issues
```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:15-alpine --restart=Never -n asset-management -- \
  psql -h postgres-auth -U auth_user -d auth_db

# Check database pod
kubectl logs postgres-auth-0 -n asset-management
```

### Ingress not working
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Describe ingress
kubectl describe ingress asset-management-ingress-simple -n asset-management
```

## 📈 Monitoring

### Install Prometheus & Grafana
```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus stack
helm install prometheus prometheus-community/kube-prometheus-stack -n asset-management

# Access Grafana
kubectl port-forward -n asset-management svc/prometheus-grafana 3000:80

# Default credentials: admin / prom-operator
```

## 🔗 Useful Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

## 📝 Production Checklist

- [ ] Update all secrets with strong passwords
- [ ] Configure proper domain name
- [ ] Setup SSL certificates (cert-manager)
- [ ] Configure resource limits and requests
- [ ] Setup monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation (ELK/Loki)
- [ ] Setup backup strategy for databases
- [ ] Configure network policies
- [ ] Setup RBAC (Role-Based Access Control)
- [ ] Enable pod security policies
- [ ] Configure persistent volume backups
- [ ] Setup CI/CD pipeline
- [ ] Configure alerts and notifications

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub.
