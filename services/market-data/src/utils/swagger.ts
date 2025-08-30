import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Market Data Service API',
      version: '1.0.0',
      description: 'Market data microservice for Asset Management System',
      contact: {
        name: 'API Support',
        email: 'support@assetmanagement.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Development server'
      },
      {
        url: 'http://localhost/market',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Stock: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'Stock symbol'
            },
            name: {
              type: 'string',
              description: 'Company name'
            },
            currentPrice: {
              type: 'number',
              description: 'Current stock price'
            },
            previousClose: {
              type: 'number',
              description: 'Previous day close price'
            },
            change: {
              type: 'number',
              description: 'Price change from previous close'
            },
            changePercent: {
              type: 'number',
              description: 'Percentage change from previous close'
            },
            volume: {
              type: 'integer',
              description: 'Trading volume'
            },
            marketCap: {
              type: 'number',
              description: 'Market capitalization'
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        HistoricalData: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date'
            },
            open: {
              type: 'number',
              description: 'Opening price'
            },
            high: {
              type: 'number',
              description: 'Highest price'
            },
            low: {
              type: 'number',
              description: 'Lowest price'
            },
            close: {
              type: 'number',
              description: 'Closing price'
            },
            volume: {
              type: 'integer',
              description: 'Trading volume'
            }
          }
        },
        MarketOverview: {
          type: 'object',
          properties: {
            indices: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Stock'
              }
            },
            topGainers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Stock'
              }
            },
            topLosers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Stock'
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
