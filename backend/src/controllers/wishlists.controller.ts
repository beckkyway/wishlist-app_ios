import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import * as wishlistsService from '../services/wishlists.service';

const visibilityEnum = z.enum(['PRIVATE', 'FRIENDS', 'PUBLIC']).optional();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  occasion: z.string().optional(),
  occasionDate: z.string().datetime().optional(),
  visibility: visibilityEnum,
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  occasion: z.string().optional(),
  occasionDate: z.string().datetime().nullable().optional(),
  visibility: visibilityEnum,
});

export async function getWishlists(req: AuthRequest, res: Response): Promise<void> {
  const wishlists = await wishlistsService.getWishlists(req.user!.userId);
  res.json(wishlists);
}

export async function createWishlist(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }
  const { title, description, occasion, occasionDate, visibility } = parsed.data;
  const wishlist = await wishlistsService.createWishlist(
    req.user!.userId,
    req.user!.role,
    title,
    description,
    occasion,
    occasionDate,
    visibility as any,
  );
  res.status(201).json(wishlist);
}

export async function getWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    const wishlist = await wishlistsService.getWishlist(req.params.id as string, req.user!.userId);
    res.json(wishlist);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    else if (err.message === 'FORBIDDEN') res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });
    else throw err;
  }
}

export async function updateWishlist(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }
  try {
    const wishlist = await wishlistsService.updateWishlist(req.params.id as string, req.user!.userId, parsed.data as any);
    res.json(wishlist);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    else throw err;
  }
}

export async function deleteWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    await wishlistsService.deleteWishlist(req.params.id as string, req.user!.userId);
    res.status(204).end();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    else throw err;
  }
}
