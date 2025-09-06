import { Request, Response } from 'express';
import { PortfolioService } from '../services/PortfolioService';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export class PortfolioController {
  private portfolioService: PortfolioService;

  constructor() {
    this.portfolioService = new PortfolioService();
  }

  getPortfolio = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const portfolio = await this.portfolioService.getPortfolio(req.userId);
      
      res.status(200).json({
        success: true,
        data: portfolio,
        message: 'Portfolio retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  addHolding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { ticker, quantity, buyPrice, category } = req.body;
      const holding = await this.portfolioService.addHolding(req.userId, {
        ticker,
        quantity,
        buyPrice,
        category,
      });
      
      res.status(201).json({
        success: true,
        data: holding,
        message: 'Holding added successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  updateHolding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const holding = await this.portfolioService.updateHolding(req.userId, id, updates);
      
      res.status(200).json({
        success: true,
        data: holding,
        message: 'Holding updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  deleteHolding = async (req: AuthenticatedRequest, res: Response) : Promise<void> => {
    try {
      const { id } = req.params;
      await this.portfolioService.deleteHolding(req.userId, id);
      
      res.status(200).json({
        success: true,
        message: 'Holding deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  syncPortfolio = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const portfolio = await this.portfolioService.syncWithAngelOne(req.userId);
      
      res.status(200).json({
        success: true,
        data: portfolio,
        message: 'Portfolio synced successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
}
