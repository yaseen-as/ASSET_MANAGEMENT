import winston from 'winston';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      service: service || 'auth-service',
      message,
      ...meta
    });
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'auth-service',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Write to console (Docker best practice)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      )
    }),
    
    // Write errors to separate file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat
    }),
    
    // Write all logs to combined file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// If we're not in production, also log to console with simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Express middleware for request logging
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  // Log request
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id || null
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - start;
    
    logger.info('HTTP Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || null
    });
    
    originalEnd.apply(this, args);
  };
  
  next();
};

// Error logging middleware
export const errorLogger = (err: any, req: any, res: any, next: any) => {
  logger.error('HTTP Error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    userId: req.user?.id || null,
    statusCode: err.statusCode || 500
  });
  
  next(err);
};
