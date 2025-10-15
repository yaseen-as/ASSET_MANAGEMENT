import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiError from './ApiError';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get token from cookies first (cookie-based auth)
    let token = req.cookies?.accessToken;
    
    // Fallback to Authorization header (for API clients)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw ApiError.unauthorized('Access token missing');
    }

    // Verify token
    try {
      if (!process.env.JWT_SECRET) {
        throw ApiError.internal('JWT secret not configured');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      (req as AuthenticatedRequest).userId = decoded.userId;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw ApiError.unauthorized('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Token expired');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
