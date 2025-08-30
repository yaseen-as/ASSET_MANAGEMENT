import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ 
  register,
  prefix: 'market_data_service_'
});

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'market_data_service_http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1, 5, 15, 50, 100, 500, 1000, 5000]
});

// HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: 'market_data_service_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Business metrics
const marketDataRequests = new client.Counter({
  name: 'market_data_service_api_requests_total',
  help: 'Total number of market data API requests',
  labelNames: ['provider', 'status']
});

const marketDataLatency = new client.Histogram({
  name: 'market_data_service_api_latency_ms',
  help: 'Latency of market data API requests',
  labelNames: ['provider'],
  buckets: [10, 50, 100, 500, 1000, 2000, 5000]
});

const cachedDataHits = new client.Counter({
  name: 'market_data_service_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['type']
});

const stockPriceUpdates = new client.Counter({
  name: 'market_data_service_price_updates_total',
  help: 'Total number of stock price updates',
  labelNames: ['symbol']
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(marketDataRequests);
register.registerMetric(marketDataLatency);
register.registerMetric(cachedDataHits);
register.registerMetric(stockPriceUpdates);

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
export const recordMarketDataRequest = (provider: string, status: 'success' | 'error') => {
  marketDataRequests.labels(provider, status).inc();
};

export const recordMarketDataLatency = (provider: string, latency: number) => {
  marketDataLatency.labels(provider).observe(latency);
};

export const recordCacheHit = (type: string) => {
  cachedDataHits.labels(type).inc();
};

export const recordStockPriceUpdate = (symbol: string) => {
  stockPriceUpdates.labels(symbol).inc();
};

// Export the register for /metrics endpoint
export { register };

export default {
  register,
  metricsMiddleware,
  recordMarketDataRequest,
  recordMarketDataLatency,
  recordCacheHit,
  recordStockPriceUpdate
};
