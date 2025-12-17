# Wazuh SOC Monitoring Setup for Asset Management

Complete Wazuh Security Operations Center (SOC) deployment for comprehensive security monitoring of your Asset Management application.

## 🛡️ Overview

Wazuh provides:
- **Real-time threat detection**
- **Security compliance monitoring** (PCI DSS, GDPR, HIPAA)
- **Vulnerability detection**
- **File integrity monitoring (FIM)**
- **Incident response**
- **Log analysis and correlation**
- **Container security**
- **Kubernetes monitoring**

## 📁 Directory Structure

```
k8s/security/
├── wazuh-namespace.yaml        # Wazuh namespace
├── wazuh-secrets.yaml          # Credentials and secrets
├── wazuh-manager.yaml          # Wazuh Manager (SIEM core)
├── wazuh-indexer.yaml          # Wazuh Indexer (Elasticsearch)
├── wazuh-dashboard.yaml        # Wazuh Dashboard (Kibana)
├── wazuh-agent.yaml            # Wazuh Agents (monitoring agents)
└── deploy-wazuh.sh             # Automated deployment script

wazuh/config/
├── custom_rules.xml            # Application-specific rules
└── custom_decoders.xml         # Log parsing decoders
```

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (Minikube, Kind, or cloud)
- kubectl configured
- Minimum 8GB RAM, 4 CPU cores
- 150GB+ storage for logs

### 1. Update Secrets

Edit `k8s/security/wazuh-secrets.yaml`:

```yaml
stringData:
  indexer-password: "YourSecurePassword123!"
  api-password: "YourAPIPassword456!"
  admin-password: "YourAdminPassword789!"
```

### 2. Deploy Wazuh Stack

```bash
# Make script executable
chmod +x k8s/security/deploy-wazuh.sh

# Deploy Wazuh SOC
./k8s/security/deploy-wazuh.sh
```

### 3. Access Wazuh Dashboard

```bash
# Port forward to access dashboard
kubectl port-forward -n wazuh svc/wazuh-dashboard 5601:443

# Open in browser
open https://localhost:5601

# Default credentials:
# Username: admin
# Password: (from wazuh-secrets.yaml)
```

## 📊 Components

### **1. Wazuh Manager** (SIEM Core)
- Central analysis engine
- Rule processing
- Alert generation
- Agent management
- **Resources**: 2-4GB RAM, 1-2 CPU cores

### **2. Wazuh Indexer** (Data Storage)
- Elasticsearch-based storage
- Log indexing and searching
- Historical data retention
- **Resources**: 4-8GB RAM, 1-2 CPU cores
- **Storage**: 100GB+

### **3. Wazuh Dashboard** (Web UI)
- Security event visualization
- Compliance reporting
- Agent management
- **Resources**: 1-2GB RAM, 500m-1 CPU

### **4. Wazuh Agents** (Data Collectors)
- Deployed on all nodes/pods
- Log collection
- File integrity monitoring
- Vulnerability scanning
- **Resources**: 256-512MB RAM, 100-500m CPU per agent

## 🔧 Configuration

### Custom Rules for Asset Management

The setup includes custom rules for:

1. **Authentication Monitoring**
   - Login attempts (successful/failed)
   - Brute force detection
   - JWT token validation

2. **Portfolio Activity**
   - Holdings changes
   - Unauthorized access attempts
   - Bulk operations

3. **Market Data Security**
   - API rate limiting
   - External API errors

4. **Database Security**
   - SQL injection attempts
   - Connection failures
   - Unauthorized queries

5. **Container Security**
   - Privilege escalation
   - Pod terminations
   - Resource anomalies

6. **Compliance Monitoring**
   - GDPR data access
   - PCI DSS transactions
   - Audit trail

### Configure Alerts

Edit Wazuh Manager configuration:

```bash
# Edit ossec.conf
kubectl exec -it -n wazuh statefulset/wazuh-manager -- vi /var/ossec/etc/ossec.conf

# Add email notifications
<global>
  <email_notification>yes</email_notification>
  <smtp_server>smtp.gmail.com</smtp_server>
  <email_from>wazuh@yourdomain.com</email_from>
  <email_to>security-team@yourdomain.com</email_to>
</global>

# Restart manager
kubectl rollout restart statefulset/wazuh-manager -n wazuh
```

## 📈 Monitoring Features

### 1. Security Event Dashboard

Access real-time security events:
- Authentication attempts
- Intrusion detection
- Malware detection
- Vulnerability alerts

### 2. Compliance Dashboards

Pre-built dashboards for:
- **PCI DSS** (Payment Card Industry)
- **GDPR** (Data Protection)
- **HIPAA** (Healthcare)
- **NIST 800-53**
- **ISO 27001**

### 3. Threat Intelligence

Integration with threat feeds:
- Known malicious IPs
- CVE database
- Malware signatures

### 4. File Integrity Monitoring

Monitor critical files:
```bash
# Add to ossec.conf
<syscheck>
  <directories check_all="yes" realtime="yes">/var/ossec/etc</directories>
  <directories check_all="yes" realtime="yes">/app/config</directories>
</syscheck>
```

## 🔍 Common Operations

### View All Wazuh Resources

```bash
kubectl get all -n wazuh
```

### View Wazuh Manager Logs

```bash
kubectl logs -f statefulset/wazuh-manager -n wazuh
```

### View Registered Agents

```bash
kubectl exec -n wazuh statefulset/wazuh-manager -- \
  /var/ossec/bin/agent_control -l
```

### View Active Alerts

```bash
kubectl exec -n wazuh statefulset/wazuh-manager -- \
  tail -f /var/ossec/logs/alerts/alerts.json
```

### Restart Wazuh Components

```bash
# Restart manager
kubectl rollout restart statefulset/wazuh-manager -n wazuh

# Restart dashboard
kubectl rollout restart deployment/wazuh-dashboard -n wazuh

# Restart agents
kubectl rollout restart daemonset/wazuh-agent -n asset-management
```

## 🎯 Use Cases

### 1. Detect Brute Force Attacks

Wazuh automatically detects multiple failed login attempts:
- **Rule ID**: 100004
- **Alert Level**: 12 (High)
- **Action**: Block IP, notify admin

### 2. Monitor Data Exfiltration

Track unusual data export patterns:
- Bulk portfolio downloads
- Mass user data access
- Unusual API calls

### 3. Compliance Reporting

Generate compliance reports:
```bash
# Access dashboard
# Navigate to: Security Events > Compliance
# Select: PCI DSS / GDPR / HIPAA
# Generate: PDF/CSV report
```

### 4. Vulnerability Management

Automatic vulnerability scanning:
- OS vulnerabilities
- Container vulnerabilities
- Application dependencies

### 5. Incident Response

When security event occurs:
1. Alert triggers in dashboard
2. Automated email notification
3. Incident details logged
4. Recommended actions displayed

## 🔐 Security Best Practices

### 1. Change Default Passwords

```bash
# Update all passwords in secrets
kubectl edit secret wazuh-secrets -n wazuh

# Update admin password
kubectl exec -n wazuh statefulset/wazuh-manager -- \
  /var/ossec/bin/wazuh-keystore -f indexer -k admin.password -v 'NewSecurePassword'
```

### 2. Enable SSL/TLS

All components use HTTPS by default. For custom certificates:

```bash
# Create secret with your certificates
kubectl create secret tls wazuh-tls -n wazuh \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key

# Update ingress to use custom cert
kubectl edit ingress wazuh-dashboard-ingress -n wazuh
```

### 3. Configure Firewall Rules

Limit access to Wazuh components:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: wazuh-network-policy
  namespace: wazuh
spec:
  podSelector:
    matchLabels:
      app: wazuh-manager
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: asset-management
```

### 4. Regular Backups

Backup Wazuh data:

```bash
# Backup indexer data
kubectl exec -n wazuh statefulset/wazuh-indexer -- \
  curl -X PUT "localhost:9200/_snapshot/backup?pretty"

# Backup manager rules
kubectl exec -n wazuh statefulset/wazuh-manager -- \
  tar -czf /tmp/rules-backup.tar.gz /var/ossec/etc/rules/
```

## 📊 Performance Tuning

### Scale Resources

```bash
# Scale Wazuh Indexer for better performance
kubectl scale statefulset wazuh-indexer --replicas=3 -n wazuh

# Increase manager resources
kubectl edit statefulset wazuh-manager -n wazuh
# Update memory: 8Gi, cpu: 4000m
```

### Optimize Log Retention

```bash
# Configure retention policy
kubectl exec -n wazuh statefulset/wazuh-indexer -- \
  curl -X PUT "localhost:9200/_ilm/policy/wazuh-policy" -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {}
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'
```

## 🧹 Cleanup

```bash
# Remove Wazuh agents
kubectl delete -f k8s/security/wazuh-agent.yaml

# Remove Wazuh stack
kubectl delete namespace wazuh
```

## 📚 Additional Resources

- [Wazuh Documentation](https://documentation.wazuh.com/)
- [Wazuh Rules Reference](https://documentation.wazuh.com/current/user-manual/ruleset/index.html)
- [Wazuh API Reference](https://documentation.wazuh.com/current/user-manual/api/reference.html)
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/)

## 🆘 Troubleshooting

### Wazuh Manager Not Starting

```bash
# Check logs
kubectl logs statefulset/wazuh-manager -n wazuh

# Check configuration
kubectl exec -n wazuh statefulset/wazuh-manager -- \
  /var/ossec/bin/wazuh-control status
```

### Agents Not Connecting

```bash
# Check agent status
kubectl logs daemonset/wazuh-agent -n asset-management

# Verify manager connectivity
kubectl exec -n asset-management -it <agent-pod> -- \
  telnet wazuh.wazuh.svc.cluster.local 1514
```

### Dashboard Access Issues

```bash
# Check dashboard pod
kubectl get pods -n wazuh -l app=wazuh-dashboard

# View dashboard logs
kubectl logs deployment/wazuh-dashboard -n wazuh

# Verify ingress
kubectl describe ingress wazuh-dashboard-ingress -n wazuh
```

---

**Security Monitoring is Critical!** Wazuh provides enterprise-grade security for your Asset Management application. 🛡️
