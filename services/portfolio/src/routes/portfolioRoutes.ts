import { Router } from 'express';
import { PortfolioController } from '../controllers/PortfolioController';
import { validateHolding } from '../utils/validation';

const router = Router();
const portfolioController = new PortfolioController();

// Health check / root route
router.get('/health', (req, res) => {
  res.json({ 
    service: 'portfolio-service',
    status: 'OK',
    endpoints: ['/', '/:id', '/sync', '/health']
  });
});

router.get('/', portfolioController.getPortfolio);
router.post('/', validateHolding, portfolioController.addHolding);
router.put('/:id', validateHolding, portfolioController.updateHolding);
router.delete('/:id', portfolioController.deleteHolding);
router.post('/sync', portfolioController.syncPortfolio);

export default router;
