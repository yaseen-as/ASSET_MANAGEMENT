import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import asyncHandler from '../utils/asyncHandler';
import { requireAuth } from '../utils/authMiddleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = asyncHandler(async (req: Request, res: Response, next?: NextFunction) => {
    const { email, name, password, angelOneApiKey, angelOneClientId } = req.body;
    const result = await this.authService.signup({
      email,
      name,
      password,
      angelOneApiKey,
      angelOneClientId,
    });
    // Set cookies
    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const response = ApiResponse.created({ user: result.user }, 'User created successfully');
    res.status(response.statusCode).json(response);
  });

  login = asyncHandler(async (req: Request, res: Response, next?: NextFunction) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    // Set cookies
    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const response = ApiResponse.success({ user: result.user }, 'Login successful');
    res.status(response.statusCode).json(response);
  });

  refresh = asyncHandler(async (req: Request, res: Response, next?: NextFunction) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }
    const result = await this.authService.refreshToken(refreshToken);
    // Set new cookies
    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const response = ApiResponse.success({}, 'Token refreshed successfully');
    res.status(response.statusCode).json(response);
  });

  logout = asyncHandler(async (req: Request, res: Response, next?: NextFunction) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    const response = ApiResponse.success(null, 'Logout successful');
    res.status(response.statusCode).json(response);
  });

  me = asyncHandler(async (req: Request, res: Response, next?: NextFunction) => {
    // Require valid access token
    const token = req.cookies['accessToken'];
    if (!token) {
      throw ApiError.unauthorized('Access token missing');
    }
    try {
      const payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET!);
      const userId = (payload as any).userId;
      const user = await this.authService.userRepository.findById(userId);
      if (!user) throw ApiError.unauthorized('User not found');
      res.json(ApiResponse.success({ user: { id: user.id, email: user.email, name: user.name } }, 'Authenticated'));
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired access token');
    }
  });
}
