import client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ 
  register,
  prefix: 'auth_service_'
});

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'auth_service_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const httpRequestTotal = new client.Counter({
  name: 'auth_service_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const activeUsers = new client.Gauge({
  name: 'auth_service_active_users',
  help: 'Number of currently active users',
  registers: [register]
});

export const loginAttempts = new client.Counter({
  name: 'auth_service_login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['status'],
  registers: [register]
});

export const tokenGenerations = new client.Counter({
  name: 'auth_service_token_generations_total',
  help: 'Total number of token generations',
  labelNames: ['type'],
  registers: [register]
});

// Express middleware to collect HTTP metrics
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

// Metrics endpoint
export const getMetrics = async () => {
  return register.metrics();
};

export { register };
