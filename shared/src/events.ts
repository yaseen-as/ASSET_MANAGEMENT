import { z } from 'zod';

// Base Event Schema
export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  version: z.string().default('1.0.0'),
  timestamp: z.string().datetime(),
  source: z.string(),
  correlationId: z.string().uuid().optional(),
  causationId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;

// =============================================================================
// AUTH DOMAIN EVENTS
// =============================================================================
export const UserRegisteredEventSchema = BaseEventSchema.extend({
  type: z.literal('user.registered'),
  data: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    username: z.string(),
    profile: z.object({
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string().optional(),
    }),
    registrationMethod: z.enum(['email', 'oauth_google', 'oauth_github']),
    verificationStatus: z.enum(['pending', 'verified']),
  }),
});

export const UserAuthenticatedEventSchema = BaseEventSchema.extend({
  type: z.literal('user.authenticated'),
  data: z.object({
    userId: z.string().uuid(),
    sessionId: z.string().uuid(),
    loginMethod: z.enum(['password', 'oauth', 'refresh_token']),
    ipAddress: z.string(),
    userAgent: z.string(),
    location: z.object({
      country: z.string().optional(),
      city: z.string().optional(),
    }).optional(),
  }),
});

export const UserLoggedOutEventSchema = BaseEventSchema.extend({
  type: z.literal('user.logged_out'),
  data: z.object({
    userId: z.string().uuid(),
    sessionId: z.string().uuid(),
    logoutReason: z.enum(['user_initiated', 'token_expired', 'security_logout']),
  }),
});

// =============================================================================
// PORTFOLIO DOMAIN EVENTS
// =============================================================================
export const PortfolioCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal('portfolio.created'),
  data: z.object({
    portfolioId: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    currency: z.string().default('INR'),
    riskProfile: z.enum(['conservative', 'moderate', 'aggressive']),
  }),
});

export const HoldingAddedEventSchema = BaseEventSchema.extend({
  type: z.literal('portfolio.holding.added'),
  data: z.object({
    portfolioId: z.string().uuid(),
    holdingId: z.string().uuid(),
    userId: z.string().uuid(),
    symbol: z.string(),
    quantity: z.number().positive(),
    averagePrice: z.number().positive(),
    totalInvestment: z.number().positive(),
    sector: z.string(),
    exchange: z.string(),
    transactionDate: z.string().datetime(),
  }),
});

export const HoldingUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal('portfolio.holding.updated'),
  data: z.object({
    portfolioId: z.string().uuid(),
    holdingId: z.string().uuid(),
    userId: z.string().uuid(),
    changes: z.object({
      quantity: z.object({
        from: z.number(),
        to: z.number(),
      }).optional(),
      averagePrice: z.object({
        from: z.number(),
        to: z.number(),
      }).optional(),
    }),
    updatedAt: z.string().datetime(),
  }),
});

export const PortfolioValueCalculatedEventSchema = BaseEventSchema.extend({
  type: z.literal('portfolio.value.calculated'),
  data: z.object({
    portfolioId: z.string().uuid(),
    userId: z.string().uuid(),
    totalValue: z.number(),
    totalInvestment: z.number(),
    totalPnL: z.number(),
    totalPnLPercentage: z.number(),
    dayPnL: z.number(),
    dayPnLPercentage: z.number(),
    holdingsCount: z.number(),
    calculatedAt: z.string().datetime(),
    marketDataTimestamp: z.string().datetime(),
  }),
});

// =============================================================================
// MARKET DATA DOMAIN EVENTS
// =============================================================================
export const StockPriceUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal('market.stock.price_updated'),
  data: z.object({
    symbol: z.string(),
    exchange: z.string(),
    price: z.number().positive(),
    previousClose: z.number().positive(),
    change: z.number(),
    changePercent: z.number(),
    volume: z.number().nonnegative(),
    high: z.number().positive(),
    low: z.number().positive(),
    open: z.number().positive(),
    timestamp: z.string().datetime(),
    marketStatus: z.enum(['open', 'closed', 'pre_market', 'after_market']),
  }),
});

export const MarketDataSyncedEventSchema = BaseEventSchema.extend({
  type: z.literal('market.data.synced'),
  data: z.object({
    symbols: z.array(z.string()),
    syncType: z.enum(['real_time', 'end_of_day', 'historical']),
    recordsUpdated: z.number().nonnegative(),
    syncStartTime: z.string().datetime(),
    syncEndTime: z.string().datetime(),
    errors: z.array(z.object({
      symbol: z.string(),
      error: z.string(),
    })).optional(),
  }),
});

export const MarketAlertTriggeredEventSchema = BaseEventSchema.extend({
  type: z.literal('market.alert.triggered'),
  data: z.object({
    alertId: z.string().uuid(),
    userId: z.string().uuid(),
    symbol: z.string(),
    alertType: z.enum(['price_target', 'percentage_change', 'volume_spike', 'technical_indicator']),
    triggerCondition: z.object({
      operator: z.enum(['greater_than', 'less_than', 'equals', 'crosses_above', 'crosses_below']),
      value: z.number(),
      currentValue: z.number(),
    }),
    message: z.string(),
    severity: z.enum(['info', 'warning', 'critical']),
  }),
});

// =============================================================================
// AI INSIGHTS DOMAIN EVENTS
// =============================================================================
export const AIInsightGeneratedEventSchema = BaseEventSchema.extend({
  type: z.literal('ai.insight.generated'),
  data: z.object({
    insightId: z.string().uuid(),
    userId: z.string().uuid(),
    portfolioId: z.string().uuid().optional(),
    symbol: z.string().optional(),
    insightType: z.enum([
      'portfolio_optimization',
      'risk_assessment',
      'market_sentiment',
      'price_prediction',
      'rebalancing_suggestion',
      'sector_analysis'
    ]),
    insight: z.object({
      title: z.string(),
      description: z.string(),
      confidence: z.number().min(0).max(1),
      recommendation: z.enum(['buy', 'sell', 'hold', 'reduce', 'increase']).optional(),
      reasoning: z.array(z.string()),
      metrics: z.record(z.number()).optional(),
    }),
    modelUsed: z.string(),
    modelVersion: z.string(),
    generatedAt: z.string().datetime(),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const AIModelTrainedEventSchema = BaseEventSchema.extend({
  type: z.literal('ai.model.trained'),
  data: z.object({
    modelId: z.string().uuid(),
    modelName: z.string(),
    modelType: z.enum(['price_prediction', 'sentiment_analysis', 'risk_assessment', 'portfolio_optimization']),
    version: z.string(),
    performance: z.object({
      accuracy: z.number().min(0).max(1),
      precision: z.number().min(0).max(1),
      recall: z.number().min(0).max(1),
      f1Score: z.number().min(0).max(1),
    }),
    trainingData: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      recordCount: z.number().positive(),
    }),
    trainedAt: z.string().datetime(),
  }),
});

// =============================================================================
// NOTIFICATION DOMAIN EVENTS
// =============================================================================
export const NotificationCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal('notification.created'),
  data: z.object({
    notificationId: z.string().uuid(),
    userId: z.string().uuid(),
    type: z.enum(['alert', 'insight', 'report', 'security', 'portfolio_update']),
    channel: z.enum(['email', 'sms', 'push', 'in_app']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    title: z.string(),
    message: z.string(),
    data: z.record(z.any()).optional(),
    scheduledAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const NotificationSentEventSchema = BaseEventSchema.extend({
  type: z.literal('notification.sent'),
  data: z.object({
    notificationId: z.string().uuid(),
    userId: z.string().uuid(),
    channel: z.enum(['email', 'sms', 'push', 'in_app']),
    status: z.enum(['sent', 'delivered', 'failed', 'bounced']),
    sentAt: z.string().datetime(),
    deliveredAt: z.string().datetime().optional(),
    error: z.string().optional(),
  }),
});

// =============================================================================
// COMMAND SCHEMAS
// =============================================================================
export const BaseCommandSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  timestamp: z.string().datetime(),
  userId: z.string().uuid(),
  correlationId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

export type BaseCommand = z.infer<typeof BaseCommandSchema>;

// Portfolio Commands
export const CreatePortfolioCommandSchema = BaseCommandSchema.extend({
  type: z.literal('portfolio.create'),
  data: z.object({
    name: z.string(),
    description: z.string().optional(),
    currency: z.string().default('INR'),
    riskProfile: z.enum(['conservative', 'moderate', 'aggressive']),
  }),
});

export const AddHoldingCommandSchema = BaseCommandSchema.extend({
  type: z.literal('portfolio.holding.add'),
  data: z.object({
    portfolioId: z.string().uuid(),
    symbol: z.string(),
    quantity: z.number().positive(),
    averagePrice: z.number().positive(),
    transactionDate: z.string().datetime(),
  }),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================
export type UserRegisteredEvent = z.infer<typeof UserRegisteredEventSchema>;
export type UserAuthenticatedEvent = z.infer<typeof UserAuthenticatedEventSchema>;
export type UserLoggedOutEvent = z.infer<typeof UserLoggedOutEventSchema>;

export type PortfolioCreatedEvent = z.infer<typeof PortfolioCreatedEventSchema>;
export type HoldingAddedEvent = z.infer<typeof HoldingAddedEventSchema>;
export type HoldingUpdatedEvent = z.infer<typeof HoldingUpdatedEventSchema>;
export type PortfolioValueCalculatedEvent = z.infer<typeof PortfolioValueCalculatedEventSchema>;

export type StockPriceUpdatedEvent = z.infer<typeof StockPriceUpdatedEventSchema>;
export type MarketDataSyncedEvent = z.infer<typeof MarketDataSyncedEventSchema>;
export type MarketAlertTriggeredEvent = z.infer<typeof MarketAlertTriggeredEventSchema>;

export type AIInsightGeneratedEvent = z.infer<typeof AIInsightGeneratedEventSchema>;
export type AIModelTrainedEvent = z.infer<typeof AIModelTrainedEventSchema>;

export type NotificationCreatedEvent = z.infer<typeof NotificationCreatedEventSchema>;
export type NotificationSentEvent = z.infer<typeof NotificationSentEventSchema>;

export type CreatePortfolioCommand = z.infer<typeof CreatePortfolioCommandSchema>;
export type AddHoldingCommand = z.infer<typeof AddHoldingCommandSchema>;

// Union types for all events
export type DomainEvent = 
  | UserRegisteredEvent
  | UserAuthenticatedEvent
  | UserLoggedOutEvent
  | PortfolioCreatedEvent
  | HoldingAddedEvent
  | HoldingUpdatedEvent
  | PortfolioValueCalculatedEvent
  | StockPriceUpdatedEvent
  | MarketDataSyncedEvent
  | MarketAlertTriggeredEvent
  | AIInsightGeneratedEvent
  | AIModelTrainedEvent
  | NotificationCreatedEvent
  | NotificationSentEvent;

export type DomainCommand = 
  | CreatePortfolioCommand
  | AddHoldingCommand;