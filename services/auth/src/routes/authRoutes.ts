import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateSignup, validateLogin, validateRefresh } from '../utils/validation';

const router = Router();
const authController = new AuthController();

// Health check / root route
router.get('/', (req, res) => {
  res.json({ 
    service: 'auth-service',
    status: 'OK',
    endpoints: ['/login', '/signup', '/logout', '/refresh', '/me', '/health']
  });
});

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refresh); // cookie-based, no validation needed
router.post('/logout', authController.logout);
router.get('/me', authController.me);
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service' });
});

export default router;
