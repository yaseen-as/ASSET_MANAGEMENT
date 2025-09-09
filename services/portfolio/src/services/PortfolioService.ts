import { HoldingRepository } from '../repositories/HoldingRepository';
import { MarketDataService } from './MarketDataService';
import ApiError from '../utils/ApiError';

export interface CreateHoldingData {
  ticker: string;
  quantity: number;
  buyPrice: number;
  category: 'SWING' | 'LONG_TERM';
}

export interface HoldingData {
  id: string;
  userId: string;
  ticker: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  category: 'SWING' | 'LONG_TERM';
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioSummary {
  holdings: any[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  swingValue: number;
  longTermValue: number;
}

export class PortfolioService {
  private holdingRepository: HoldingRepository;
  private marketDataService: MarketDataService;

  constructor() {
    this.holdingRepository = new HoldingRepository();
    this.marketDataService = new MarketDataService();
  }

  async getPortfolio(userId: string): Promise<PortfolioSummary> {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }

    const holdings = await this.holdingRepository.findByUserId(userId);
    
    // Update current prices
    const updatedHoldings = await Promise.all(
      holdings.map(async (holding: HoldingData) => {
        try {
          const currentPrice = await this.marketDataService.getCurrentPrice(holding.ticker);
          const updatedHolding = await this.holdingRepository.updatePrice(holding.id, currentPrice);
          
          // Calculate P&L
          const investment = Number(updatedHolding.buyPrice) * updatedHolding.quantity;
          const currentValue = currentPrice * updatedHolding.quantity;
          const pnl = currentValue - investment;
          const pnlPercentage = investment > 0 ? (pnl / investment) * 100 : 0;

          return {
            ...updatedHolding,
            currentPrice,
            pnl,
            pnlPercentage,
            investment,
            currentValue,
          };
        } catch (error) {
          console.error(`Failed to update price for ${holding.ticker}:`, error);
          return {
            ...holding,
            currentPrice: Number(holding.currentPrice),
            pnl: 0,
            pnlPercentage: 0,
            investment: Number(holding.buyPrice) * holding.quantity,
            currentValue: Number(holding.currentPrice) * holding.quantity,
          };
        }
      })
    );

    // Calculate totals
    const totalValue = updatedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalInvestment = updatedHoldings.reduce((sum, h) => sum + h.investment, 0);
    const totalPnl = totalValue - totalInvestment;
    const totalPnlPercentage = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

    // Calculate category-wise values
    const swingValue = updatedHoldings
      .filter(h => h.category === 'SWING')
      .reduce((sum, h) => sum + h.currentValue, 0);
    
    const longTermValue = updatedHoldings
      .filter(h => h.category === 'LONG_TERM')
      .reduce((sum, h) => sum + h.currentValue, 0);

    return {
      holdings: updatedHoldings,
      totalValue,
      totalPnl,
      totalPnlPercentage,
      swingValue,
      longTermValue,
    };
  }

  async addHolding(userId: string, data: CreateHoldingData) {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }

    if (!data.ticker || !data.quantity || !data.buyPrice || !data.category) {
      throw ApiError.badRequest('All holding fields are required: ticker, quantity, buyPrice, category');
    }

    if (data.quantity <= 0) {
      throw ApiError.badRequest('Quantity must be greater than 0');
    }

    if (data.buyPrice <= 0) {
      throw ApiError.badRequest('Buy price must be greater than 0');
    }

    return await this.holdingRepository.create({
      ...data,
      userId,
    });
  }

  async updateHolding(userId: string, id: string, updates: Partial<CreateHoldingData>) {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }

    if (!id) {
      throw ApiError.badRequest('Holding ID is required');
    }

    const holding = await this.holdingRepository.findById(id);
    if (!holding) {
      throw ApiError.notFound('Holding not found');
    }

    if (holding.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to update this holding');
    }

    if (updates.quantity !== undefined && updates.quantity <= 0) {
      throw ApiError.badRequest('Quantity must be greater than 0');
    }

    if (updates.buyPrice !== undefined && updates.buyPrice <= 0) {
      throw ApiError.badRequest('Buy price must be greater than 0');
    }

    return await this.holdingRepository.update(id, updates);
  }

  async deleteHolding(userId: string, id: string) {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }

    if (!id) {
      throw ApiError.badRequest('Holding ID is required');
    }

    const holding = await this.holdingRepository.findById(id);
    if (!holding) {
      throw ApiError.notFound('Holding not found');
    }

    if (holding.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this holding');
    }

    return await this.holdingRepository.delete(id);
  }

  async syncWithAngelOne(userId: string): Promise<PortfolioSummary> {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }

    // TODO: Implement Angel One API integration
    // For now, just return current portfolio
    console.log('Angel One sync not implemented yet');
    return await this.getPortfolio(userId);
  }
}
