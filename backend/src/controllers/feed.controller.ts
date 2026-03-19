import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as feedService from '../services/feed.service';

export async function getFeed(req: AuthRequest, res: Response): Promise<void> {
  const cursor = req.query.cursor as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const result = await feedService.getFeed(req.user!.userId, cursor, limit);
  res.json(result);
}
