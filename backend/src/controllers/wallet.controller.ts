import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import * as walletService from '../services/wallet.service';

export async function getWallet(req: AuthRequest, res: Response): Promise<void> {
  const wallet = await walletService.getWallet(req.user!.userId);
  res.json(wallet);
}

export async function getTransactions(req: AuthRequest, res: Response): Promise<void> {
  const cursor = req.query.cursor as string | undefined;
  const result = await walletService.getTransactions(req.user!.userId, cursor);
  res.json(result);
}

export async function depositCoins(req: AuthRequest, res: Response): Promise<void> {
  const parsed = z.object({ amount: z.number().int().positive() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid amount', code: 'VALIDATION_ERROR' });
    return;
  }
  const result = await walletService.depositCoins(req.user!.userId, parsed.data.amount);
  res.json(result);
}

export async function sendCoins(req: AuthRequest, res: Response): Promise<void> {
  const parsed = z.object({
    toUserId: z.string(),
    amount: z.number().int().positive(),
    note: z.string().optional(),
  }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const result = await walletService.sendCoins(
      req.user!.userId,
      parsed.data.toUserId,
      parsed.data.amount,
      parsed.data.note,
    );
    res.json(result);
  } catch (err: any) {
    const errorMap: Record<string, [number, string]> = {
      INVALID_AMOUNT: [400, 'Invalid amount'],
      CANNOT_SEND_TO_SELF: [400, 'Cannot send coins to yourself'],
      RECEIVER_NOT_FOUND: [404, 'Recipient not found'],
      INSUFFICIENT_BALANCE: [400, 'Insufficient SurpriseCoin balance'],
    };
    const [status, message] = errorMap[err.message] ?? [500, 'Internal error'];
    res.status(status).json({ error: message, code: err.message });
  }
}
