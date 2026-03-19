import prisma from '../db';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { UserRole } from '@prisma/client';

const SIGNUP_BONUS = 100;

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  coinBalance: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
} as const;

export async function register(email: string, password: string, name?: string, role: UserRole = UserRole.USER) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('EMAIL_TAKEN');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, passwordHash, name, role, coinBalance: SIGNUP_BONUS },
      select: USER_SELECT,
    });

    await tx.coinTransaction.create({
      data: {
        ownerId: created.id,
        amount: SIGNUP_BONUS,
        type: 'SIGNUP_BONUS',
        description: 'Welcome bonus',
      },
    });

    return created;
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { token, user };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  const { passwordHash: _, ...safeUser } = user;
  return { token, user: safeUser };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: USER_SELECT,
  });
  return user;
}
