import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import marketRoutes from './routes/marketRoutes';
import { errorHandler } from './utils/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true, // Enable cookies
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/', marketRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Market data service running on port ${PORT}`);
});
