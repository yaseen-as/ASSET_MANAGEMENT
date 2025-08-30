import { Request, Response } from 'express';
import { AngelOneService } from '../services/AngelOneService';

export class MarketController {
  private angelOneService: AngelOneService;

  constructor() {
    this.angelOneService = new AngelOneService();
  }

  getPrice = async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const price = await this.angelOneService.getCurrentPrice(symbol.toUpperCase());
      
      res.status(200).json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          price,
          timestamp: new Date().toISOString(),
        },
        message: 'Price retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const history = await this.angelOneService.getHistoricalData(symbol.toUpperCase());
      
      res.status(200).json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          history,
        },
        message: 'Historical data retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}
