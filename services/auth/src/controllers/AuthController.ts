import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import asyncHandler from '../utils/asyncHandler';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, password, angelOneApiKey, angelOneClientId } = req.body;
    
    const result = await this.authService.signup({
      email,
      name,
      password,
      angelOneApiKey,
      angelOneClientId,
    });
    
    const response = ApiResponse.created(result, 'User created successfully');
    res.status(response.statusCode).json(response);
  });

  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    
    const result = await this.authService.login(email, password);
    
    const response = ApiResponse.success(result, 'Login successful');
    res.status(response.statusCode).json(response);
  });

  refresh = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }
    
    const result = await this.authService.refreshToken(refreshToken);
    
    const response = ApiResponse.success(result, 'Token refreshed successfully');
    res.status(response.statusCode).json(response);
  });

  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    
    const response = ApiResponse.success(null, 'Logout successful');
    res.status(response.statusCode).json(response);
  });
}
