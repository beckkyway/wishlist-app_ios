import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '30d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
