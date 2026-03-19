import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { parseUrl } from '../controllers/parseUrl.controller';

const router = Router();

router.post('/', requireAuth, parseUrl);

export default router;
