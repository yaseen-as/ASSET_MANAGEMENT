import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateSignup, validateLogin, validateRefresh } from '../utils/validation';

const router = Router();
const authController = new AuthController();

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', validateRefresh, authController.refresh);
router.post('/logout', authController.logout);

export default router;
