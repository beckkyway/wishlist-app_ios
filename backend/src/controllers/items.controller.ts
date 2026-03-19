import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import * as itemsService from '../services/items.service';
import { Priority, ItemStatus } from '@prisma/client';

const priorityEnum = z.enum(['MUST_HAVE', 'NORMAL', 'DREAM']);
const statusEnum = z.enum(['AVAILABLE', 'RESERVED', 'COLLECTING', 'COLLECTED']);

const createSchema = z.object({
  wishlistId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  url: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  priority: priorityEnum.optional(),
  isGroupGift: z.boolean().optional(),
  targetAmount: z.number().positive().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive().nullable().optional(),
  url: z.string().url().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  isGroupGift: z.boolean().optional(),
  targetAmount: z.number().positive().nullable().optional(),
});

export async function createItem(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }
  try {
    const item = await itemsService.createItem(req.user!.userId, {
      ...parsed.data,
      priority: parsed.data.priority as Priority | undefined,
    });
    res.status(201).json(item);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    else throw err;
  }
}

export async function updateItem(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }
  try {
    const item = await itemsService.updateItem(req.params.id as string, req.user!.userId, {
      ...parsed.data,
      priority: parsed.data.priority as Priority | undefined,
      status: parsed.data.status as ItemStatus | undefined,
    });
    res.json(item);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    else throw err;
  }
}

export async function deleteItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    await itemsService.deleteItem(req.params.id as string, req.user!.userId);
    res.status(204).end();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    else throw err;
  }
}
