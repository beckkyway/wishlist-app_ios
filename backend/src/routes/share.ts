import { Router } from 'express';
import * as shareController from '../controllers/share.controller';

const router = Router();

router.get('/:token', shareController.getSharedWishlist);
router.get('/:token/items', shareController.getSharedItems);

export default router;
