import prisma from '../db';
import { getFriendIds } from './friendship.service';

export async function getFeed(userId: string, cursor?: string, limit = 20) {
  const friendIds = await getFriendIds(userId);

  const items = await prisma.item.findMany({
    where: {
      wishlist: {
        OR: [
          // Public wishlists from everyone (except self)
          { visibility: 'PUBLIC', ownerId: { not: userId } },
          // Friends-only wishlists from friends
          { visibility: 'FRIENDS', ownerId: { in: friendIds } },
        ],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      wishlist: {
        select: {
          id: true,
          title: true,
          visibility: true,
          owner: {
            select: { id: true, name: true, avatarUrl: true, role: true },
          },
        },
      },
      coinDonations: { select: { amount: true } },
    },
  });

  const hasMore = items.length > limit;
  const feedItems = (hasMore ? items.slice(0, limit) : items).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    price: item.price ? Number(item.price) : null,
    coinTarget: item.coinTarget,
    coinDonationTotal: item.coinDonations.reduce((sum, d) => sum + d.amount, 0),
    status: item.status,
    priority: item.priority,
    createdAt: item.createdAt,
    wishlistId: item.wishlist.id,
    wishlistTitle: item.wishlist.title,
    owner: item.wishlist.owner,
  }));

  return {
    items: feedItems,
    nextCursor: hasMore ? feedItems[feedItems.length - 1].id : null,
  };
}
