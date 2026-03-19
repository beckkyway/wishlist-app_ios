import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import * as coinDonationsService from '../services/coinDonations.service';

export async function donateCoins(req: AuthRequest, res: Response): Promise<void> {
  const parsed = z.object({
    itemId: z.string(),
    amount: z.number().int().positive(),
  }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const result = await coinDonationsService.donateCoins(
      req.user!.userId,
      parsed.data.itemId,
      parsed.data.amount,
    );
    res.status(201).json(result);
  } catch (err: any) {
    const errorMap: Record<string, [number, string]> = {
      INVALID_AMOUNT: [400, 'Invalid amount'],
      ITEM_NOT_FOUND: [404, 'Item not found'],
      FORBIDDEN: [403, 'Access denied'],
      INSUFFICIENT_BALANCE: [400, 'Insufficient SurpriseCoin balance'],
    };
    const [status, message] = errorMap[err.message] ?? [500, 'Internal error'];
    res.status(status).json({ error: message, code: err.message });
  }
}

export async function getItemDonations(req: AuthRequest, res: Response): Promise<void> {
  const result = await coinDonationsService.getItemDonations(req.params.itemId as string);
  res.json(result);
}
