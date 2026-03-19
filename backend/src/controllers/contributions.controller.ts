import { Request, Response } from 'express';
import { z } from 'zod';
import * as contributionsService from '../services/contributions.service';

const createSchema = z.object({
  itemId: z.string(),
  amount: z.number().positive(),
  guestName: z.string().min(1),
  guestEmail: z.string().email().optional(),
});

export async function createContribution(req: Request, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }
  try {
    const contribution = await contributionsService.createContribution(
      parsed.data.itemId,
      parsed.data.amount,
      parsed.data.guestName,
      parsed.data.guestEmail,
    );
    res.status(201).json({ ...contribution, amount: Number(contribution.amount) });
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    else if (err.message === 'NOT_GROUP_ITEM') res.status(400).json({ error: 'Item does not have a target amount', code: 'NOT_GROUP_ITEM' });
    else if (err.message === 'INVALID_AMOUNT') res.status(400).json({ error: 'Amount must be positive', code: 'INVALID_AMOUNT' });
    else throw err;
  }
}

export async function getContributions(req: Request, res: Response): Promise<void> {
  const result = await contributionsService.getContributions(req.params.itemId as string);
  res.json(result);
}
