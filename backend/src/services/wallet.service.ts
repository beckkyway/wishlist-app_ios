import prisma from '../db';

export async function getWallet(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { coinBalance: true },
  });
  return { balance: user.coinBalance };
}

export async function getTransactions(userId: string, cursor?: string, limit = 20) {
  const transactions = await prisma.coinTransaction.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      owner: { select: { id: true, name: true } },
    },
  });

  const hasMore = transactions.length > limit;
  const items = hasMore ? transactions.slice(0, limit) : transactions;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}

export async function depositCoins(userId: string, amount: number) {
  if (amount < 1 || !Number.isInteger(amount)) throw new Error('INVALID_AMOUNT');

  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { coinBalance: { increment: amount } } });
    await tx.coinTransaction.create({
      data: {
        ownerId: userId,
        amount,
        type: 'SIGNUP_BONUS',
        description: `Пополнение: +${amount} монет`,
      },
    });
    const updated = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { coinBalance: true } });
    return { newBalance: updated.coinBalance };
  });
}

export async function sendCoins(senderId: string, toUserId: string, amount: number, note?: string) {
  if (amount < 1 || !Number.isInteger(amount)) throw new Error('INVALID_AMOUNT');
  if (senderId === toUserId) throw new Error('CANNOT_SEND_TO_SELF');

  const receiver = await prisma.user.findUnique({ where: { id: toUserId } });
  if (!receiver) throw new Error('RECEIVER_NOT_FOUND');

  return prisma.$transaction(async (tx) => {
    const sender = await tx.user.findUniqueOrThrow({ where: { id: senderId }, select: { coinBalance: true } });

    if (sender.coinBalance < amount) throw new Error('INSUFFICIENT_BALANCE');

    await tx.user.update({ where: { id: senderId }, data: { coinBalance: { decrement: amount } } });
    await tx.user.update({ where: { id: toUserId }, data: { coinBalance: { increment: amount } } });

    await tx.coinTransaction.create({
      data: {
        ownerId: senderId,
        amount: -amount,
        type: 'SENT',
        description: note ?? `Sent to ${receiver.name ?? receiver.email}`,
        relatedUserId: toUserId,
      },
    });
    await tx.coinTransaction.create({
      data: {
        ownerId: toUserId,
        amount,
        type: 'RECEIVED',
        description: note ?? `Received from sender`,
        relatedUserId: senderId,
      },
    });

    const updatedSender = await tx.user.findUniqueOrThrow({
      where: { id: senderId },
      select: { coinBalance: true },
    });

    return { newBalance: updatedSender.coinBalance };
  });
}
