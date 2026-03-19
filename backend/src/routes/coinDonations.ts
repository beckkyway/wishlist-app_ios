import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as coinDonationsController from '../controllers/coinDonations.controller';

const router = Router();

router.use(requireAuth);

router.post('/', coinDonationsController.donateCoins);
router.get('/item/:itemId', coinDonationsController.getItemDonations);

export default router;
