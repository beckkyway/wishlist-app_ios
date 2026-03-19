import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(['USER', 'ORG']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const result = await authService.register(
      parsed.data.email,
      parsed.data.password,
      parsed.data.name,
      parsed.data.role as any,
    );
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message === 'EMAIL_TAKEN') {
      res.status(409).json({ error: 'Email already in use', code: 'EMAIL_TAKEN' });
    } else {
      throw err;
    }
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const result = await authService.login(parsed.data.email, parsed.data.password);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    } else {
      throw err;
    }
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  const user = await authService.getMe(req.user!.userId);
  res.json(user);
}
