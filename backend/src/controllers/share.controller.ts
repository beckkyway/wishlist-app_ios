import { Request, Response } from 'express';
import * as shareService from '../services/share.service';

export async function getSharedWishlist(req: Request, res: Response): Promise<void> {
  try {
    const wishlist = await shareService.getSharedWishlist(req.params.token as string);
    res.json(wishlist);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Wishlist not found', code: 'NOT_FOUND' });
    else throw err;
  }
}

export async function getSharedItems(req: Request, res: Response): Promise<void> {
  try {
    const items = await shareService.getSharedItems(req.params.token as string);
    res.json(items);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Wishlist not found', code: 'NOT_FOUND' });
    else throw err;
  }
}
