import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import portfolioRoutes from './routes/portfolioRoutes';
import { errorHandler } from './utils/errorHandler';
import { authMiddleware } from './utils/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true, // Enable cookies
}));
app.use(cookieParser());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    service: 'portfolio-service',
    status: 'OK',
    endpoints: ['/', '/:id', '/sync', '/health']
  });
});

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'portfolio-service' });
});

// Routes
app.use('/', authMiddleware, portfolioRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Portfolio service running on port ${PORT}`);
});
