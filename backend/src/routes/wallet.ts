import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as walletController from '../controllers/wallet.controller';

const router = Router();

router.use(requireAuth);

router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);
router.post('/send', walletController.sendCoins);
router.post('/deposit', walletController.depositCoins);

export default router;
