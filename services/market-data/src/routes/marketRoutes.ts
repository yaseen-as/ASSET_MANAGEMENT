import { Router } from 'express';
import { MarketController } from '../controllers/MarketController';

const router = Router();
const marketController = new MarketController();

// Health check / root route
router.get('/', (req, res) => {
  res.json({ 
    service: 'market-data-service',
    status: 'OK',
    endpoints: ['/price/:symbol', '/history/:symbol', '/health']
  });
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'market-data-service' });
});

router.get('/price/:symbol', marketController.getPrice);
router.get('/history/:symbol', marketController.getHistory);

export default router;
