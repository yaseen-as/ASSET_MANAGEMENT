import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateSignup, validateLogin, validateRefresh } from '../utils/validation';

const router = Router();
const authController = new AuthController();


router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refresh); // cookie-based, no validation needed
router.post('/logout', authController.logout);
router.get('/me', authController.me);

export default router;
