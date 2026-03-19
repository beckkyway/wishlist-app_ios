import { Router } from 'express';
import * as reservationsController from '../controllers/reservations.controller';

const router = Router();

router.post('/', reservationsController.createReservation);
router.delete('/:id', reservationsController.deleteReservation);

export default router;
