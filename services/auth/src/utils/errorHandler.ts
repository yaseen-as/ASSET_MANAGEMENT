import { Request, Response, NextFunction } from 'express';
import ApiError from './ApiError';
import { logger } from './logger';

/**
 * Global error handler middleware for Auth Service
 * Handles both ApiError instances and generic errors
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error with request context
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id || null,
    requestId: (req as any).requestId || null
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    });
  }

  // Handle Joi validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [err.message],
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    let message = 'Database error';
    let statusCode = 500;

    // Handle specific Prisma error codes
    if ((err as any).code === 'P2002') {
      message = 'A record with this data already exists';
      statusCode = 409;
    } else if ((err as any).code === 'P2025') {
      message = 'Record not found';
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    });
  }

  // Default error response
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
