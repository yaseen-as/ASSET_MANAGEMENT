import { HoldingRepository } from '../repositories/HoldingRepository';
import { MarketDataService } from './MarketDataService';

export interface CreateHoldingData {
  ticker: string;
  quantity: number;
  buyPrice: number;
  category: 'SWING' | 'LONG_TERM';
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
    const holdings = await this.holdingRepository.findByUserId(userId);
    
    // Update current prices
    const updatedHoldings = await Promise.all(
      holdings.map(async (holding) => {
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
    return await this.holdingRepository.create({
      ...data,
      userId,
    });
  }

  async updateHolding(userId: string, id: string, updates: Partial<CreateHoldingData>) {
    const holding = await this.holdingRepository.findById(id);
    if (!holding || holding.userId !== userId) {
      throw new Error('Holding not found');
    }

    return await this.holdingRepository.update(id, updates);
  }

  async deleteHolding(userId: string, id: string) {
    const holding = await this.holdingRepository.findById(id);
    if (!holding || holding.userId !== userId) {
      throw new Error('Holding not found');
    }

    return await this.holdingRepository.delete(id);
  }

  async syncWithAngelOne(userId: string): Promise<PortfolioSummary> {
    // TODO: Implement Angel One API integration
    // For now, just return current portfolio
    console.log('Angel One sync not implemented yet');
    return await this.getPortfolio(userId);
  }
}
