import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiError from './ApiError';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['accessToken'];
  if (!token) {
    return next(ApiError.unauthorized('Access token missing'));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = { id: (payload as any).userId };
    next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired access token'));
  }
}
