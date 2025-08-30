import { Router } from 'express';
import { PortfolioController } from '../controllers/PortfolioController';
import { validateHolding } from '../utils/validation';

const router = Router();
const portfolioController = new PortfolioController();

router.get('/', portfolioController.getPortfolio);
router.post('/', validateHolding, portfolioController.addHolding);
router.put('/:id', validateHolding, portfolioController.updateHolding);
router.delete('/:id', portfolioController.deleteHolding);
router.post('/sync', portfolioController.syncPortfolio);

export default router;
