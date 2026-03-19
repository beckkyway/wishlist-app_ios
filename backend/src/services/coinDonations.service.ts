import prisma from '../db';
import { areFriends } from './friendship.service';

export async function donateCoins(donorId: string, itemId: string, amount: number) {
  if (amount < 1 || !Number.isInteger(amount)) throw new Error('INVALID_AMOUNT');

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { wishlist: { select: { ownerId: true, visibility: true } } },
  });
  if (!item) throw new Error('ITEM_NOT_FOUND');

  const { ownerId, visibility } = item.wishlist;

  // Check access
  if (ownerId !== donorId) {
    if (visibility === 'PRIVATE') throw new Error('FORBIDDEN');
    if (visibility === 'FRIENDS') {
      const friends = await areFriends(donorId, ownerId);
      if (!friends) throw new Error('FORBIDDEN');
    }
  }

  return prisma.$transaction(async (tx) => {
    const donor = await tx.user.findUniqueOrThrow({
      where: { id: donorId },
      select: { coinBalance: true },
    });

    if (donor.coinBalance < amount) throw new Error('INSUFFICIENT_BALANCE');

    await tx.user.update({ where: { id: donorId }, data: { coinBalance: { decrement: amount } } });

    await tx.coinTransaction.create({
      data: {
        ownerId: donorId,
        amount: -amount,
        type: 'DONATED',
        description: `Donated to "${item.title}"`,
        relatedUserId: ownerId,
      },
    });

    const donation = await tx.coinDonation.create({
      data: { donorId, itemId, amount },
    });

    const updatedDonor = await tx.user.findUniqueOrThrow({
      where: { id: donorId },
      select: { coinBalance: true },
    });

    return { donation, newBalance: updatedDonor.coinBalance };
  });
}

export async function getItemDonations(itemId: string) {
  const donations = await prisma.coinDonation.findMany({
    where: { itemId },
    include: {
      donor: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  return {
    total,
    count: donations.length,
    topDonors: donations
      .reduce((acc: Array<{ id: string; name: string | null; avatarUrl: string | null; amount: number }>, d) => {
        const existing = acc.find(a => a.id === d.donor.id);
        if (existing) {
          existing.amount += d.amount;
        } else {
          acc.push({ id: d.donor.id, name: d.donor.name, avatarUrl: d.donor.avatarUrl, amount: d.amount });
        }
        return acc;
      }, [])
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
  };
}
