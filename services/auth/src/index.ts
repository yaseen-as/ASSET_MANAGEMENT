import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './utils/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true // Enable credentials (cookies) to be sent
}));
app.use(cookieParser()); // Parse cookies
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/', authRoutes); // Also support routes without /auth prefix

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth-service' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
