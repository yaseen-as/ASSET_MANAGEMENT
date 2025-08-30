import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import marketRoutes from './routes/marketRoutes';
import { errorHandler } from './utils/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/market', marketRoutes);
app.use('/', marketRoutes); // Also support routes without /market prefix

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'market-data-service' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Market data service running on port ${PORT}`);
});
