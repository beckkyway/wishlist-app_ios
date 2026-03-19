import { Request, Response } from 'express';
import { z } from 'zod';
import * as reservationsService from '../services/reservations.service';

const createSchema = z.object({
  itemId: z.string(),
  guestName: z.string().min(1),
  guestEmail: z.string().email().optional(),
});

export async function createReservation(req: Request, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }
  try {
    const reservation = await reservationsService.createReservation(
      parsed.data.itemId,
      parsed.data.guestName,
      parsed.data.guestEmail,
    );
    res.status(201).json(reservation);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    else if (err.message === 'ALREADY_RESERVED') res.status(409).json({ error: 'Item already reserved', code: 'ALREADY_RESERVED' });
    else throw err;
  }
}

export async function deleteReservation(req: Request, res: Response): Promise<void> {
  try {
    await reservationsService.deleteReservation(req.params.id as string);
    res.status(204).end();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    else throw err;
  }
}
