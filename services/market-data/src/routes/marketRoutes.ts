import { Router } from 'express';
import { MarketController } from '../controllers/MarketController';

const router = Router();
const marketController = new MarketController();

router.get('/price/:symbol', marketController.getPrice);
router.get('/history/:symbol', marketController.getHistory);

export default router;
