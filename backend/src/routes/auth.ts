import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests', code: 'RATE_LIMIT' },
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', requireAuth, authController.me);

export default router;
