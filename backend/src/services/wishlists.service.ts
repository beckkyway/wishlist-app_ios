import prisma from '../db';
import { generateShareToken } from '../utils/shareToken';
import { WishlistVisibility, UserRole } from '@prisma/client';
import { areFriends } from './friendship.service';

const ITEM_INCLUDE = {
  reservation: true,
  contributions: { select: { amount: true } },
  coinDonations: { select: { amount: true } },
} as const;

function mapItem(item: any) {
  return {
    ...item,
    price: item.price ? Number(item.price) : null,
    targetAmount: item.targetAmount ? Number(item.targetAmount) : null,
    contributionTotal: item.contributions.reduce((sum: number, c: any) => sum + Number(c.amount), 0),
    coinDonationTotal: item.coinDonations.reduce((sum: number, d: any) => sum + d.amount, 0),
    contributions: undefined,
    coinDonations: undefined,
  };
}

export async function getWishlists(ownerId: string) {
  return prisma.wishlist.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true } } },
  });
}

export async function createWishlist(
  ownerId: string,
  ownerRole: UserRole,
  title: string,
  description?: string,
  occasion?: string,
  occasionDate?: string,
  visibility?: WishlistVisibility,
) {
  const defaultVisibility = ownerRole === UserRole.ORG ? WishlistVisibility.PUBLIC : WishlistVisibility.PRIVATE;

  return prisma.wishlist.create({
    data: {
      title,
      description,
      occasion,
      occasionDate: occasionDate ? new Date(occasionDate) : undefined,
      ownerId,
      shareToken: generateShareToken(),
      visibility: visibility ?? defaultVisibility,
    },
    include: { _count: { select: { items: true } } },
  });
}

export async function getWishlist(id: string, requestingUserId: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
        include: ITEM_INCLUDE,
      },
    },
  });
  if (!wishlist) throw new Error('NOT_FOUND');

  // Owner can always see their own wishlist
  if (wishlist.ownerId === requestingUserId) {
    return formatWishlist(wishlist);
  }

  // Check visibility
  if (wishlist.visibility === 'PRIVATE') {
    throw new Error('FORBIDDEN');
  }
  if (wishlist.visibility === 'FRIENDS') {
    const friends = await areFriends(requestingUserId, wishlist.ownerId);
    if (!friends) throw new Error('FORBIDDEN');
  }

  return formatWishlist(wishlist);
}

function formatWishlist(wishlist: any) {
  return {
    ...wishlist,
    items: wishlist.items.map(mapItem),
  };
}

export async function updateWishlist(
  id: string,
  ownerId: string,
  data: {
    title?: string;
    description?: string;
    occasion?: string;
    occasionDate?: string | null;
    visibility?: WishlistVisibility;
  },
) {
  const wishlist = await prisma.wishlist.findFirst({ where: { id, ownerId } });
  if (!wishlist) throw new Error('NOT_FOUND');

  return prisma.wishlist.update({
    where: { id },
    data: {
      ...data,
      occasionDate: data.occasionDate === null
        ? null
        : data.occasionDate
        ? new Date(data.occasionDate)
        : undefined,
    },
    include: { _count: { select: { items: true } } },
  });
}

export async function deleteWishlist(id: string, ownerId: string) {
  const wishlist = await prisma.wishlist.findFirst({ where: { id, ownerId } });
  if (!wishlist) throw new Error('NOT_FOUND');
  await prisma.wishlist.delete({ where: { id } });
}
