import prisma from '../db';

export async function createContribution(itemId: string, amount: number, guestName: string, guestEmail?: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('NOT_FOUND');
  if (!item.targetAmount) throw new Error('NOT_GROUP_ITEM');
  if (amount <= 0) throw new Error('INVALID_AMOUNT');

  return prisma.contribution.create({
    data: { itemId, amount, guestName, guestEmail },
  });
}

export async function getContributions(itemId: string) {
  const contributions = await prisma.contribution.findMany({
    where: { itemId },
    orderBy: { createdAt: 'desc' },
  });

  const total = contributions.reduce((sum, c) => sum + Number(c.amount), 0);
  return {
    total,
    count: contributions.length,
    list: contributions.map(c => ({ ...c, amount: Number(c.amount) })),
  };
}
