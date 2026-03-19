import { Router } from 'express';
import { suggestGifts } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.post('/suggest', suggestGifts);

export default router;
