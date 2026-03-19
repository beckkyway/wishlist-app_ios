import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as friendsController from '../controllers/friends.controller';

const router = Router();

router.use(requireAuth);

router.get('/search', friendsController.searchUsers);
router.get('/:userId/wishlists', friendsController.getFriendWishlists);
router.get('/', friendsController.getFriends);
router.get('/requests/incoming', friendsController.getIncomingRequests);
router.get('/requests/outgoing', friendsController.getOutgoingRequests);
router.post('/requests', friendsController.sendRequest);
router.patch('/requests/:id', friendsController.respondToRequest);
router.delete('/:userId', friendsController.unfriend);

export default router;
