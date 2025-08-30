import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ 
  register,
  prefix: 'portfolio_service_'
});

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'portfolio_service_http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1, 5, 15, 50, 100, 500, 1000, 5000]
});

// HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: 'portfolio_service_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Business metrics
const portfolioOperations = new client.Counter({
  name: 'portfolio_service_operations_total',
  help: 'Total number of portfolio operations',
  labelNames: ['operation', 'status']
});

const activePortfolios = new client.Gauge({
  name: 'portfolio_service_active_portfolios',
  help: 'Number of active portfolios'
});

const portfolioValue = new client.Histogram({
  name: 'portfolio_service_portfolio_value',
  help: 'Portfolio values in dollars',
  buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000]
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(portfolioOperations);
register.registerMetric(activePortfolios);
register.registerMetric(portfolioValue);

// Middleware to collect HTTP metrics
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
      
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

// Helper functions for business metrics
export const recordPortfolioOperation = (operation: string, status: 'success' | 'error') => {
  portfolioOperations.labels(operation, status).inc();
};

export const updateActivePortfoliosCount = (count: number) => {
  activePortfolios.set(count);
};

export const recordPortfolioValue = (value: number) => {
  portfolioValue.observe(value);
};

// Export the register for /metrics endpoint
export { register };

export default {
  register,
  metricsMiddleware,
  recordPortfolioOperation,
  updateActivePortfoliosCount,
  recordPortfolioValue
};
