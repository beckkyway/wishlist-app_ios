import prisma from '../db';

export async function getSharedWishlist(token: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { shareToken: token },
    include: { owner: { select: { name: true, email: true } } },
  });
  if (!wishlist) throw new Error('NOT_FOUND');

  return {
    id: wishlist.id,
    title: wishlist.title,
    description: wishlist.description,
    occasion: wishlist.occasion,
    occasionDate: wishlist.occasionDate,
    ownerName: wishlist.owner.name || wishlist.owner.email,
    createdAt: wishlist.createdAt,
  };
}

export async function getSharedItems(token: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { shareToken: token },
    include: {
      items: {
        where: { status: { not: 'COLLECTED' } },
        orderBy: { createdAt: 'asc' },
        include: {
          reservation: true,
          contributions: { select: { amount: true } },
        },
      },
    },
  });
  if (!wishlist) throw new Error('NOT_FOUND');

  return wishlist.items.map(item => ({
    ...item,
    price: item.price ? Number(item.price) : null,
    targetAmount: item.targetAmount ? Number(item.targetAmount) : null,
    contributionTotal: item.contributions.reduce((sum, c) => sum + Number(c.amount), 0),
    contributions: undefined,
  }));
}
