import { Request, Response, NextFunction } from 'express';
import { AngelOneService } from '../services/AngelOneService';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import asyncHandler from '../utils/asyncHandler';

export class MarketController {
  private angelOneService: AngelOneService;

  constructor() {
    this.angelOneService = new AngelOneService();
  }

  getPrice = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { symbol } = req.params;
    
    if (!symbol) {
      throw ApiError.badRequest('Stock symbol is required');
    }

    const price = await this.angelOneService.getCurrentPrice(symbol.toUpperCase());
    
    const responseData = {
      symbol: symbol.toUpperCase(),
      price,
      timestamp: new Date().toISOString(),
    };
    
    const response = ApiResponse.success(responseData, 'Price retrieved successfully');
    res.status(response.statusCode).json(response);
  });

  getHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { symbol } = req.params;
    
    if (!symbol) {
      throw ApiError.badRequest('Stock symbol is required');
    }

    const history = await this.angelOneService.getHistoricalData(symbol.toUpperCase());
    
    const responseData = {
      symbol: symbol.toUpperCase(),
      history,
    };
    
    const response = ApiResponse.success(responseData, 'Historical data retrieved successfully');
    res.status(response.statusCode).json(response);
  });
}
