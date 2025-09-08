import { Request, Response, NextFunction } from 'express';
import { PortfolioService } from '../services/PortfolioService';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import asyncHandler from '../utils/asyncHandler';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export class PortfolioController {
  private portfolioService: PortfolioService;

  constructor() {
    this.portfolioService = new PortfolioService();
  }

  getPortfolio = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const portfolio = await this.portfolioService.getPortfolio(req.userId);
    
    const response = ApiResponse.success(portfolio, 'Portfolio retrieved successfully');
    res.status(response.statusCode).json(response);
  });

  addHolding = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { ticker, quantity, buyPrice, category } = req.body;
    
    if (!ticker || !quantity || !buyPrice || !category) {
      throw ApiError.badRequest('Missing required fields: ticker, quantity, buyPrice, category');
    }

    const holding = await this.portfolioService.addHolding(req.userId, {
      ticker,
      quantity,
      buyPrice,
      category,
    });
    
    const response = ApiResponse.created(holding, 'Holding added successfully');
    res.status(response.statusCode).json(response);
  });

  updateHolding = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      throw ApiError.badRequest('Holding ID is required');
    }

    const holding = await this.portfolioService.updateHolding(req.userId, id, updates);
    
    const response = ApiResponse.success(holding, 'Holding updated successfully');
    res.status(response.statusCode).json(response);
  });

  deleteHolding = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    
    if (!id) {
      throw ApiError.badRequest('Holding ID is required');
    }

    await this.portfolioService.deleteHolding(req.userId, id);
    
    const response = ApiResponse.success(null, 'Holding deleted successfully');
    res.status(response.statusCode).json(response);
  });

  syncPortfolio = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const portfolio = await this.portfolioService.syncWithAngelOne(req.userId);
    
    const response = ApiResponse.success(portfolio, 'Portfolio synced successfully');
    res.status(response.statusCode).json(response);
  });
}
