import { Router } from 'express';
import * as contributionsController from '../controllers/contributions.controller';

const router = Router();

router.post('/', contributionsController.createContribution);
router.get('/:itemId', contributionsController.getContributions);

export default router;
