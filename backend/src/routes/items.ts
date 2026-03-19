import { Router } from 'express';
import * as itemsController from '../controllers/items.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', itemsController.createItem);
router.patch('/:id', itemsController.updateItem);
router.delete('/:id', itemsController.deleteItem);

export default router;
