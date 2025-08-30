import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// Custom log format for structured JSON logging
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      service: service || 'portfolio-service',
      message,
      ...meta
    });
  })
);

// Create Winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'portfolio-service' },
  transports: [
    // Console output for Docker
    new winston.transports.Console(),
    
    // File output for persistent logging
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Add request ID to request object for tracing
  (req as any).requestId = requestId;
  
  // Log incoming request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      responseSize: JSON.stringify(data).length
    });
    
    return originalJson(data);
  };
  
  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId;
  
  logger.error('Request error', {
    requestId,
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack
  });
  
  next(err);
};

export default logger;
