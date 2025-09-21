import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import portfolioRoutes from './routes/portfolioRoutes';
import { errorHandler } from './utils/errorHandler';
import { authMiddleware } from './utils/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'portfolio-service' });
});

// Routes
app.use('/portfolio', authMiddleware, portfolioRoutes);
app.use('/', authMiddleware, portfolioRoutes); // Also support routes without /portfolio prefix


// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Portfolio service running on port ${PORT}`);
});
