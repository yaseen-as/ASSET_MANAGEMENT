import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Service API',
      version: '1.0.0',
      description: 'Portfolio management microservice for Asset Management System',
      contact: {
        name: 'API Support',
        email: 'support@assetmanagement.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server'
      },
      {
        url: 'http://localhost/portfolio',
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
        Portfolio: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Portfolio ID'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns the portfolio'
            },
            name: {
              type: 'string',
              description: 'Portfolio name'
            },
            totalValue: {
              type: 'number',
              description: 'Total portfolio value in dollars'
            },
            totalGainLoss: {
              type: 'number',
              description: 'Total gain/loss in dollars'
            },
            totalGainLossPercentage: {
              type: 'number',
              description: 'Total gain/loss percentage'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Holding: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Holding ID'
            },
            portfolioId: {
              type: 'string',
              description: 'Portfolio ID'
            },
            symbol: {
              type: 'string',
              description: 'Stock symbol'
            },
            quantity: {
              type: 'integer',
              description: 'Number of shares'
            },
            purchasePrice: {
              type: 'number',
              description: 'Purchase price per share'
            },
            currentPrice: {
              type: 'number',
              description: 'Current price per share'
            },
            gainLoss: {
              type: 'number',
              description: 'Gain/loss in dollars'
            },
            gainLossPercentage: {
              type: 'number',
              description: 'Gain/loss percentage'
            },
            purchaseDate: {
              type: 'string',
              format: 'date-time'
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
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
