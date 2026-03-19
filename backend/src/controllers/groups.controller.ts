import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import * as groupsService from '../services/groups.service';

export async function createGroup(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, description } = z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
    }).parse(req.body);
    const group = await groupsService.createGroup(req.user!.userId, name, description);
    res.status(201).json(group);
  } catch (e) { next(e); }
}

export async function joinGroup(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { joinCode } = z.object({ joinCode: z.string().min(1) }).parse(req.body);
    const group = await groupsService.joinGroup(req.user!.userId, joinCode);
    res.json(group);
  } catch (e: any) {
    if (e.message === 'GROUP_NOT_FOUND') return res.status(404).json({ error: 'Группа не найдена' });
    if (e.message === 'ALREADY_MEMBER') return res.status(409).json({ error: 'Вы уже в этой группе' });
    next(e);
  }
}

export async function getMyGroups(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const groups = await groupsService.getMyGroups(req.user!.userId);
    res.json(groups);
  } catch (e) { next(e); }
}

export async function getGroup(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const group = await groupsService.getGroup(req.user!.userId, req.params.id);
    res.json(group);
  } catch (e: any) {
    if (e.message === 'NOT_MEMBER') return res.status(403).json({ error: 'Вы не состоите в этой группе' });
    if (e.message === 'GROUP_NOT_FOUND') return res.status(404).json({ error: 'Группа не найдена' });
    next(e);
  }
}

export async function addGroupItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, description, coinTarget, imageUrl } = z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
      coinTarget: z.number().int().positive().optional(),
      imageUrl: z.string().url().optional(),
    }).parse(req.body);
    const item = await groupsService.addGroupItem(req.user!.userId, req.params.id, title, description, coinTarget, imageUrl);
    res.status(201).json(item);
  } catch (e: any) {
    if (e.message === 'FORBIDDEN') return res.status(403).json({ error: 'Только администратор может добавлять запросы' });
    next(e);
  }
}

export async function donateToGroupItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { amount } = z.object({ amount: z.number().int().positive() }).parse(req.body);
    const result = await groupsService.donateToGroupItem(req.user!.userId, req.params.itemId, amount);
    res.json(result);
  } catch (e: any) {
    if (e.message === 'INVALID_AMOUNT') return res.status(400).json({ error: 'Некорректная сумма' });
    if (e.message === 'ITEM_NOT_FOUND') return res.status(404).json({ error: 'Запрос не найден' });
    if (e.message === 'NOT_MEMBER') return res.status(403).json({ error: 'Вы не состоите в этой группе' });
    if (e.message === 'INSUFFICIENT_BALANCE') return res.status(400).json({ error: 'Недостаточно монет' });
    next(e);
  }
}
