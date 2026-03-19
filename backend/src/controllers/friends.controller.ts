import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import * as friendshipService from '../services/friendship.service';

export async function sendRequest(req: AuthRequest, res: Response): Promise<void> {
  const parsed = z.object({ receiverId: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'receiverId is required', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const request = await friendshipService.sendRequest(req.user!.userId, parsed.data.receiverId);
    res.status(201).json(request);
  } catch (err: any) {
    if (err.message === 'CANNOT_ADD_SELF') {
      res.status(400).json({ error: 'Cannot add yourself', code: 'CANNOT_ADD_SELF' });
    } else if (err.message === 'ALREADY_EXISTS') {
      res.status(409).json({ error: 'Request already exists', code: 'ALREADY_EXISTS' });
    } else {
      throw err;
    }
  }
}

export async function respondToRequest(req: AuthRequest, res: Response): Promise<void> {
  const parsed = z.object({ action: z.enum(['accept', 'decline']) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'action must be accept or decline', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const result = await friendshipService.respondToRequest(
      req.params.id as string,
      req.user!.userId,
      parsed.data.action,
    );
    res.json(result);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Request not found', code: 'NOT_FOUND' });
    } else {
      throw err;
    }
  }
}

export async function unfriend(req: AuthRequest, res: Response): Promise<void> {
  try {
    await friendshipService.unfriend(req.user!.userId, req.params.userId as string);
    res.status(204).end();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Friendship not found', code: 'NOT_FOUND' });
    } else {
      throw err;
    }
  }
}

export async function getFriends(req: AuthRequest, res: Response): Promise<void> {
  const friends = await friendshipService.getFriends(req.user!.userId);
  res.json(friends);
}

export async function getIncomingRequests(req: AuthRequest, res: Response): Promise<void> {
  const requests = await friendshipService.getIncomingRequests(req.user!.userId);
  res.json(requests);
}

export async function getOutgoingRequests(req: AuthRequest, res: Response): Promise<void> {
  const requests = await friendshipService.getOutgoingRequests(req.user!.userId);
  res.json(requests);
}

export async function getFriendWishlists(req: AuthRequest, res: Response): Promise<void> {
  const wishlists = await friendshipService.getFriendWishlists(
    req.user!.userId,
    req.params.userId as string,
  );
  res.json(wishlists);
}

export async function searchUsers(req: AuthRequest, res: Response): Promise<void> {
  const q = (req.query.q as string) ?? '';
  if (q.length < 2) {
    res.json([]);
    return;
  }
  const users = await friendshipService.searchUsers(q, req.user!.userId);
  res.json(users);
}
