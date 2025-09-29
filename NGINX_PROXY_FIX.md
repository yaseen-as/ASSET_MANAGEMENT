# Nginx & Proxy Configuration Fix

## 🚨 Issues Fixed

### **Problem**: 
- Nginx not working properly
- Proxy issues preventing frontend from connecting to backend services
- Frontend not correctly redirecting to backend services

### **Root Causes**:
1. **Nginx URL rewriting issues** - `/auth/` patterns not matching properly
2. **CORS headers missing** - Backend requests failing due to CORS
3. **Conflicting proxy configs** - Vite proxy conflicting with nginx
4. **Service routing problems** - URL paths not stripped correctly

## ✅ **Solutions Applied**

### 1. **Fixed Nginx Configuration** (`/nginx/nginx.conf`)

**Key Improvements**:
- ✅ **Proper URL Rewriting**: Using regex patterns `^/auth(/.*)?$` to match both `/auth` and `/auth/`
- ✅ **Path Stripping**: Remove `/auth` prefix before forwarding to service
- ✅ **CORS Headers**: Added comprehensive CORS support for development
- ✅ **OPTIONS Handling**: Proper preflight request handling
- ✅ **Enhanced Logging**: Better error tracking and access logs
- ✅ **WebSocket Support**: For Vite HMR in development

**Route Mapping**:
```nginx
/auth/login    → http://auth-service-dev:3001/login
/portfolio/    → http://portfolio-service-dev:3002/
/market/       → http://market-service-dev:3003/
/              → http://frontend-dev:3000/
```

### 2. **Removed Vite Proxy Conflict** (`/frontend/vite.config.ts`)

**Why**: Vite proxy was conflicting with nginx. Now nginx handles all routing.

### 3. **Enhanced API Service** (`/frontend/src/services/api.ts`)

**Improvements**:
- ✅ **CORS Support**: Added `withCredentials: true`
- ✅ **Debug Logging**: All API calls now logged
- ✅ **Better Error Handling**: Enhanced 401 handling
- ✅ **Nginx Compatibility**: Optimized for nginx proxy

### 4. **Created Debug Tools** (`/scripts/nginx-debug.sh`)

**Features**:
- ✅ **Configuration Testing**: Validate nginx config
- ✅ **Service Connectivity**: Check all services
- ✅ **Route Testing**: Test all proxy routes
- ✅ **API Endpoint Testing**: End-to-end API tests
- ✅ **Log Analysis**: View nginx access/error logs

## 🚀 **How to Test the Fix**

### **Step 1: Start All Services**
```bash
cd /home/ioss/Desktop/as/ASSET_MANAGEMENT

# Start databases
docker-compose --profile dev up -d postgres-auth postgres-portfolio postgres-market

# Start backend services
docker-compose --profile dev up -d auth-service-dev portfolio-service-dev market-service-dev

# Start frontend
docker-compose --profile dev up -d frontend-dev

# Start nginx (this is the key!)
docker-compose --profile dev up -d nginx-dev
```

### **Step 2: Verify Services**
```bash
# Check if all services are running
docker-compose ps

# Should show:
# ✅ nginx-dev (port 8080)
# ✅ frontend-dev (port 3000) 
# ✅ auth-service-dev (port 3001)
# ✅ portfolio-service-dev (port 3002)
# ✅ market-service-dev (port 3003)
```

### **Step 3: Test Nginx Routing**
```bash
# Run the debug script
./scripts/nginx-debug.sh --all

# Or manually test:
curl http://localhost:8080/nginx-health    # Should return "healthy"
curl http://localhost:8080/api/health      # Should return JSON status
curl http://localhost:8080/auth/health     # Should proxy to auth service
curl http://localhost:8080/               # Should return frontend HTML
```

### **Step 4: Test Frontend**
1. **Open**: http://localhost:8080 (NOT 3000!)
2. **Expected**: Frontend loads through nginx
3. **Login**: API calls should go through nginx to backend
4. **Network Tab**: Should see requests to `localhost:8080/auth/login`

## 📊 **Architecture Flow**

```
Browser (localhost:8080)
    ↓
Nginx (nginx-dev:80)
    ↓
┌─────────────────────┬────────────────────┐
│ /auth/*            │ /portfolio/*       │ /market/*
│ ↓                  │ ↓                  │ ↓
│ auth-service-dev   │ portfolio-service  │ market-service
│ :3001              │ :3002              │ :3003
└─────────────────────┴────────────────────┘
│ /*                 │
│ ↓                  │
│ frontend-dev:3000  │
└────────────────────┘
```

## 🔧 **Configuration Details**

### **Nginx Upstream Configuration**
```nginx
upstream auth_service {
    server auth-service-dev:3001;
}

upstream portfolio_service {
    server portfolio-service-dev:3002;
}

upstream market_service {
    server market-service-dev:3003;
}

upstream frontend {
    server frontend-dev:3000;
}
```

### **URL Rewrite Rules**
```nginx
# /auth/login → auth-service:3001/login
location ~ ^/auth(/.*)?$ {
    rewrite ^/auth(/.*)?$ $1 break;
    proxy_pass http://auth_service;
}

# /portfolio/holdings → portfolio-service:3002/holdings
location ~ ^/portfolio(/.*)?$ {
    rewrite ^/portfolio(/.*)?$ $1 break;
    proxy_pass http://portfolio_service;
}
```

### **CORS Headers for Development**
```nginx
add_header Access-Control-Allow-Origin $http_origin always;
add_header Access-Control-Allow-Credentials true always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept" always;
```

## 🐛 **Troubleshooting**

### **Issue: "Connection refused"**
```bash
# Check if nginx is running
docker-compose ps nginx-dev

# Check nginx logs
docker-compose logs nginx-dev

# Restart nginx
docker-compose restart nginx-dev
```

### **Issue: "502 Bad Gateway"**
```bash
# Check if backend services are running
docker-compose ps | grep "service-dev"

# Check service logs
docker-compose logs auth-service-dev
docker-compose logs portfolio-service-dev
docker-compose logs market-service-dev
```

### **Issue: "CORS Error"**
```bash
# Check nginx configuration
docker-compose exec nginx-dev nginx -t

# Reload nginx config
docker-compose restart nginx-dev
```

### **Issue: "404 Not Found on API calls"**
```bash
# Test nginx routes manually
curl -v http://localhost:8080/auth/health
curl -v http://localhost:8080/portfolio/
curl -v http://localhost:8080/market/

# Check nginx access logs
./scripts/nginx-debug.sh
# Choose option 5 (Show nginx logs)
```

## 📋 **Important URLs**

- **Frontend**: http://localhost:8080 (through nginx)
- **Direct Frontend**: http://localhost:3000 (for development)
- **Nginx Health**: http://localhost:8080/nginx-health
- **API Health**: http://localhost:8080/api/health
- **Auth Service**: http://localhost:8080/auth/* → auth-service:3001
- **Portfolio Service**: http://localhost:8080/portfolio/* → portfolio:3002
- **Market Service**: http://localhost:8080/market/* → market:3003

## 🎯 **Expected Results**

✅ **Frontend loads at localhost:8080**  
✅ **API calls go through nginx proxy**  
✅ **CORS headers work properly**  
✅ **Authentication flows correctly**  
✅ **All backend services accessible**  
✅ **No more proxy/routing issues**  

Your nginx and proxy issues should now be completely resolved! 🚀