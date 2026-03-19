import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as feedController from '../controllers/feed.controller';

const router = Router();

router.use(requireAuth);
router.get('/', feedController.getFeed);

export default router;
