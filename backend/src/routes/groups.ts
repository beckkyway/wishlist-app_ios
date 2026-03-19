import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as groupsController from '../controllers/groups.controller';

const router = Router();
router.use(requireAuth);

router.get('/', groupsController.getMyGroups);
router.post('/', groupsController.createGroup);
router.post('/join', groupsController.joinGroup);
router.get('/:id', groupsController.getGroup);
router.post('/:id/items', groupsController.addGroupItem);
router.post('/:id/items/:itemId/donate', groupsController.donateToGroupItem);

export default router;
