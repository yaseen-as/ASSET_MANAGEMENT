import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import winston from 'winston';
import expressWinston from 'express-winston';
import { EventBus } from '@asset-management/shared';
import { AuthMiddleware } from './middleware/auth';
import { WebSocketHandler } from './websocket/handler';
import { MetricsCollector } from './utils/metrics';

/**
 * API Gateway - Entry point for all client requests
 * Handles routing, authentication, rate limiting, and real-time communication
 */
class ApiGateway {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private eventBus: EventBus;
  private logger: winston.Logger;
  private metrics: MetricsCollector;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
      }
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/api-gateway.log' })
      ]
    });

    this.eventBus = new EventBus({
      kafka: {
        brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
        clientId: 'api-gateway',
        groupId: 'api-gateway-group'
      },
      redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
    });

    this.metrics = new MetricsCollector();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Request logging
    this.app.use(expressWinston.logger({
      winstonInstance: this.logger,
      meta: true,
      msg: "HTTP {{req.method}} {{req.url}}",
      expressFormat: true,
      colorize: false,
    }));

    // Metrics collection
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.metrics.recordHttpRequest(req.method, req.route?.path || req.path, res.statusCode, duration);
      });
      next();
    });
  }

  /**
   * Setup API routes and service proxies
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Metrics endpoint
    this.app.get('/metrics', (req, res) => {
      res.json(this.metrics.getMetrics());
    });

    // Authentication service proxy
    this.app.use('/api/auth', createProxyMiddleware({
      target: process.env.AUTH_SERVICE_URL || 'http://auth-service-v2:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/api/auth': ''
      },
      on: {
        proxyReq: (proxyReq, req) => {
          this.logger.info(`Proxying auth request: ${req.method} ${req.url}`);
        },
        error: (err, req, res) => {
          this.logger.error('Auth service proxy error:', err);
          res.status(503).json({ error: 'Auth service unavailable' });
        }
      }
    }));

    // Portfolio service proxy (with authentication)
    this.app.use('/api/portfolio', 
      AuthMiddleware.authenticate,
      createProxyMiddleware({
        target: process.env.PORTFOLIO_SERVICE_URL || 'http://portfolio-service-v2:3002',
        changeOrigin: true,
        pathRewrite: {
          '^/api/portfolio': ''
        },
        on: {
          proxyReq: (proxyReq, req: any) => {
            // Forward user context
            if (req.user) {
              proxyReq.setHeader('X-User-ID', req.user.userId);
              proxyReq.setHeader('X-User-Email', req.user.email);
            }
            this.logger.info(`Proxying portfolio request: ${req.method} ${req.url}`);
          },
          error: (err, req, res) => {
            this.logger.error('Portfolio service proxy error:', err);
            res.status(503).json({ error: 'Portfolio service unavailable' });
          }
        }
      })
    );

    // Market data service proxy (with authentication)
    this.app.use('/api/market',
      AuthMiddleware.authenticate,
      createProxyMiddleware({
        target: process.env.MARKET_SERVICE_URL || 'http://market-data-service-v2:3003',
        changeOrigin: true,
        pathRewrite: {
          '^/api/market': ''
        },
        on: {
          proxyReq: (proxyReq, req: any) => {
            if (req.user) {
              proxyReq.setHeader('X-User-ID', req.user.userId);
              proxyReq.setHeader('X-User-Email', req.user.email);
            }
            this.logger.info(`Proxying market data request: ${req.method} ${req.url}`);
          },
          error: (err, req, res) => {
            this.logger.error('Market data service proxy error:', err);
            res.status(503).json({ error: 'Market data service unavailable' });
          }
        }
      })
    );

    // AI Insights service proxy (with authentication)
    this.app.use('/api/ai',
      AuthMiddleware.authenticate,
      createProxyMiddleware({
        target: process.env.AI_SERVICE_URL || 'http://ai-insights-service:3004',
        changeOrigin: true,
        pathRewrite: {
          '^/api/ai': ''
        },
        on: {
          proxyReq: (proxyReq, req: any) => {
            if (req.user) {
              proxyReq.setHeader('X-User-ID', req.user.userId);
              proxyReq.setHeader('X-User-Email', req.user.email);
            }
            this.logger.info(`Proxying AI service request: ${req.method} ${req.url}`);
          },
          error: (err, req, res) => {
            this.logger.error('AI service proxy error:', err);
            res.status(503).json({ error: 'AI service unavailable' });
          }
        }
      })
    );

    // Notification service proxy (with authentication)
    this.app.use('/api/notifications',
      AuthMiddleware.authenticate,
      createProxyMiddleware({
        target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
        changeOrigin: true,
        pathRewrite: {
          '^/api/notifications': ''
        },
        on: {
          proxyReq: (proxyReq, req: any) => {
            if (req.user) {
              proxyReq.setHeader('X-User-ID', req.user.userId);
              proxyReq.setHeader('X-User-Email', req.user.email);
            }
            this.logger.info(`Proxying notification request: ${req.method} ${req.url}`);
          },
          error: (err, req, res) => {
            this.logger.error('Notification service proxy error:', err);
            res.status(503).json({ error: 'Notification service unavailable' });
          }
        }
      })
    );

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });

    // Error handler
    this.app.use(expressWinston.errorLogger({
      winstonInstance: this.logger
    }));

    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  /**
   * Setup WebSocket handling for real-time communication
   */
  private setupWebSocket(): void {
    const wsHandler = new WebSocketHandler(this.io, this.eventBus, this.logger);
    wsHandler.initialize();
  }

  /**
   * Initialize the API Gateway
   */
  async initialize(): Promise<void> {
    try {
      // Initialize event bus
      await this.eventBus.initialize();
      this.logger.info('Event bus initialized');

      // Setup event listeners for real-time updates
      await this.setupEventListeners();

      const port = process.env.PORT || 3000;
      this.server.listen(port, () => {
        this.logger.info(`API Gateway running on port ${port}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      this.logger.error('Failed to initialize API Gateway:', error);
      process.exit(1);
    }
  }

  /**
   * Setup event listeners for broadcasting to WebSocket clients
   */
  private async setupEventListeners(): Promise<void> {
    // Subscribe to real-time events
    await this.eventBus.subscribeToRealTimeEvents([
      'portfolio.value.calculated',
      'market.stock.price_updated',
      'market.alert.triggered',
      'ai.insight.generated',
      'notification.created'
    ], (event) => {
      // Broadcast to appropriate WebSocket rooms
      this.io.to(`user:${event.data?.userId}`).emit('event', event);
      
      // Broadcast market events to all connected clients
      if (event.type.startsWith('market.')) {
        this.io.emit('market_update', event);
      }
    });
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    this.logger.info('Shutting down API Gateway...');
    
    this.server.close(() => {
      this.logger.info('HTTP server closed');
    });

    await this.eventBus.shutdown();
    this.logger.info('Event bus closed');
    
    process.exit(0);
  }
}

// Start the API Gateway
const gateway = new ApiGateway();
gateway.initialize().catch(console.error);