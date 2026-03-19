import { Router } from 'express';
import * as wishlistsController from '../controllers/wishlists.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', wishlistsController.getWishlists);
router.post('/', wishlistsController.createWishlist);
router.get('/:id', wishlistsController.getWishlist);
router.patch('/:id', wishlistsController.updateWishlist);
router.delete('/:id', wishlistsController.deleteWishlist);

export default router;
