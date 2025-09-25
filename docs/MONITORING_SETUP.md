# Asset Management - Monitoring & Security Setup

## 🎯 Overview

Your Asset Management system now includes comprehensive monitoring, streaming, and security analysis capabilities. This setup provides:

### ✅ Complete Monitoring Stack
- **Prometheus**: Metrics collection from all services
- **Grafana**: Beautiful dashboards with real-time visualization
- **AlertManager**: Multi-channel alerting (Slack, Email, webhooks)
- **Node Exporter**: System metrics monitoring
- **Postgres Exporter**: Database metrics monitoring

### ✅ Streaming Infrastructure  
- **Redis**: Caching and pub/sub messaging
- **Kafka + Zookeeper**: Event streaming and message queues
- **WebSocket**: Real-time data streaming to frontend

### ✅ Security Analysis
- **Wazuh**: Complete security monitoring platform
- **File Integrity Monitoring**: Detect unauthorized changes
- **Vulnerability Scanning**: Identify security weaknesses
- **Threat Detection**: Monitor for suspicious activities
- **Compliance Monitoring**: Security compliance reporting

### ✅ Grafana Dashboards Created
1. **Application Overview**: Service metrics, request rates, response times
2. **Security Dashboard**: Security events, failed logins, threat monitoring
3. **Streaming Dashboard**: Redis/Kafka metrics, real-time data flow
4. **Infrastructure Dashboard**: System resources, container metrics

## 🚀 Quick Start

### 1. Deploy Complete Stack (Recommended for First Time)
```bash
./scripts/monitoring.sh deploy-all
```

This will start all services in the correct order:
- Databases → Monitoring → Streaming → Security → Application

### 2. Access Your Dashboards
- **Asset Management App**: http://localhost
- **Grafana Dashboards**: http://localhost:3001 (admin/admin)
- **Prometheus Metrics**: http://localhost:9090
- **AlertManager**: http://localhost:9093
- **Wazuh Security**: https://localhost:443 (admin/SecretPassword)

### 3. Verify Everything is Working
```bash
./scripts/monitoring.sh health
```

## 🔧 Management Commands

### Deploy Specific Components
```bash
./scripts/monitoring.sh deploy-monitoring    # Just monitoring
./scripts/monitoring.sh deploy-streaming     # Just streaming
./scripts/monitoring.sh deploy-security      # Just security
./scripts/monitoring.sh deploy-app          # Just application
```

### Monitor and Maintain
```bash
./scripts/monitoring.sh status              # Check service status
./scripts/monitoring.sh logs               # View all logs
./scripts/monitoring.sh logs grafana       # View specific service logs
./scripts/monitoring.sh update-config      # Reload configurations
./scripts/monitoring.sh backup            # Backup monitoring data
./scripts/monitoring.sh stop              # Stop all services
```

## 📊 Grafana Dashboards

### 1. Application Overview Dashboard
- **Request Rates**: Real-time API request metrics
- **Response Times**: Service latency monitoring  
- **Error Rates**: 4xx/5xx error tracking
- **Service Health**: Uptime and availability
- **Resource Usage**: CPU/Memory per service

### 2. Security Dashboard
- **Failed Login Attempts**: Authentication security
- **Security Events**: Real-time threat detection
- **Active Alerts**: Current security incidents
- **Threat Distribution**: Attack pattern analysis
- **Suspicious IPs**: Potential threat sources

### 3. Streaming Dashboard
- **Redis Metrics**: Connection count, memory usage
- **Kafka Throughput**: Message rates, consumer lag
- **WebSocket Connections**: Real-time connection monitoring
- **Data Updates**: Market data and portfolio update rates

### 4. Infrastructure Dashboard
- **System Resources**: CPU, Memory, Disk usage
- **Network I/O**: Network traffic monitoring
- **Container Metrics**: Docker container resources
- **Database Connections**: PostgreSQL connection pools
- **Service Health**: Overall system health status

## 🚨 Alerting System

### Alert Channels Configured
- **Slack**: Real-time notifications to your team
- **Email**: Important alerts via email
- **Webhook**: Custom integrations

### Alert Rules Include
- **High CPU/Memory usage** (>85%)
- **Service downtime** (any service unavailable)
- **Database connection issues**
- **High error rates** (>5% 4xx/5xx errors)
- **Streaming infrastructure issues**
- **Security incidents** (failed logins, threats)
- **Disk space warnings** (>80% full)

## 🛡️ Security Monitoring

### Wazuh Features Active
- **File Integrity Monitoring**: Detects unauthorized file changes
- **Rootkit Detection**: Scans for hidden malware
- **Vulnerability Assessment**: Identifies security weaknesses
- **Active Response**: Automated threat mitigation
- **Compliance Reporting**: PCI DSS, GDPR compliance checks

### Security Rules Configured
- **Asset Management Specific**: Custom rules for your application
- **Authentication Monitoring**: Login/logout tracking
- **API Abuse Detection**: Rate limiting violations
- **Database Security**: SQL injection attempts
- **File System Monitoring**: Critical file changes

## 📈 Metrics Collection

### Application Metrics
```typescript
// Example: How to add custom metrics to your Node.js services
import promClient from 'prom-client';

const requestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'status_code', 'endpoint']
});

// In your Express middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    requestCounter.labels(req.method, res.statusCode, req.path).inc();
  });
  next();
});

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
});
```

## 🔄 Streaming Integration

### Redis Pub/Sub Example
```typescript
// Publisher (in your services)
import Redis from 'ioredis';
const redis = new Redis('redis://localhost:6379');

// Publish portfolio updates
redis.publish('portfolio:updates', JSON.stringify({
  userId: 'user123',
  holdings: updatedHoldings,
  timestamp: Date.now()
}));
```

### WebSocket Real-time Updates
```typescript
// Frontend real-time connection
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'portfolio:update') {
    updatePortfolioUI(data.payload);
  }
};
```

## 🐛 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check Docker daemon
sudo systemctl status docker

# Check logs
./scripts/monitoring.sh logs

# Restart specific service
docker-compose restart grafana
```

**Grafana dashboards not loading:**
```bash
# Restart Grafana
docker-compose restart grafana

# Check Grafana logs
./scripts/monitoring.sh logs grafana
```

**Wazuh not accessible:**
```bash
# Wait 3-5 minutes for initialization
./scripts/monitoring.sh logs wazuh-manager

# Check if ports are open
netstat -tlnp | grep :443
```

**Prometheus not scraping metrics:**
```bash
# Check Prometheus config
docker-compose exec prometheus cat /etc/prometheus/prometheus.yml

# Reload configuration
./scripts/monitoring.sh update-config
```

### Resource Requirements
- **Minimum RAM**: 8GB (16GB recommended)
- **Disk Space**: 20GB for data storage
- **CPU**: 4+ cores recommended

### Port Usage
- **3000**: Frontend
- **3001**: Grafana
- **3001-3003**: Microservices  
- **9090**: Prometheus
- **9093**: AlertManager
- **443**: Wazuh Dashboard
- **6379**: Redis
- **9092**: Kafka

## 📚 Additional Resources

### Documentation Links
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/)
- [Grafana Dashboard Creation](https://grafana.com/docs/grafana/latest/dashboards/)
- [Wazuh Security Rules](https://documentation.wazuh.com/current/user-manual/ruleset/)
- [Kafka Streaming](https://kafka.apache.org/documentation/streams/)

### Useful Commands
```bash
# View Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check Grafana API
curl -u admin:admin http://localhost:3001/api/health

# Redis CLI
docker-compose exec redis redis-cli

# Kafka topics
docker-compose exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

## 🎉 You're All Set!

Your Asset Management system now has enterprise-grade monitoring, streaming, and security capabilities. The comprehensive observability stack will help you:

- **Monitor application performance** in real-time
- **Detect and respond to security threats** automatically  
- **Stream real-time data** to your users
- **Alert your team** when issues occur
- **Maintain compliance** with security standards

Run `./scripts/monitoring.sh deploy-all` to get started! 🚀