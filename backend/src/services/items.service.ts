import prisma from '../db';
import { Priority, ItemStatus } from '@prisma/client';

interface CreateItemData {
  wishlistId: string;
  title: string;
  description?: string;
  price?: number;
  url?: string;
  imageUrl?: string;
  priority?: Priority;
  isGroupGift?: boolean;
  targetAmount?: number;
}

interface UpdateItemData {
  title?: string;
  description?: string | null;
  price?: number | null;
  url?: string | null;
  imageUrl?: string | null;
  priority?: Priority;
  status?: ItemStatus;
  isGroupGift?: boolean;
  targetAmount?: number | null;
}

function serializeItem(item: any) {
  return {
    ...item,
    price: item.price ? Number(item.price) : null,
    targetAmount: item.targetAmount ? Number(item.targetAmount) : null,
  };
}

export async function createItem(ownerId: string, data: CreateItemData) {
  const wishlist = await prisma.wishlist.findFirst({
    where: { id: data.wishlistId, ownerId },
  });
  if (!wishlist) throw new Error('NOT_FOUND');

  const isGroupGift = data.isGroupGift ?? (data.targetAmount != null);
  const status: ItemStatus = isGroupGift ? 'COLLECTING' : 'AVAILABLE';

  const item = await prisma.item.create({
    data: {
      wishlistId: data.wishlistId,
      title: data.title,
      description: data.description,
      price: data.price,
      url: data.url,
      imageUrl: data.imageUrl,
      priority: data.priority ?? 'NORMAL',
      status,
      isGroupGift,
      targetAmount: data.targetAmount,
    },
    include: { reservation: true },
  });
  return serializeItem(item);
}

export async function updateItem(id: string, ownerId: string, data: UpdateItemData) {
  const item = await prisma.item.findFirst({
    where: { id, wishlist: { ownerId } },
  });
  if (!item) throw new Error('NOT_FOUND');

  // Recalculate isGroupGift if targetAmount changes
  let isGroupGift = data.isGroupGift;
  if (data.targetAmount !== undefined) {
    isGroupGift = data.targetAmount != null;
  }

  const updated = await prisma.item.update({
    where: { id },
    data: {
      ...data,
      isGroupGift,
    },
    include: { reservation: true },
  });
  return serializeItem(updated);
}

export async function deleteItem(id: string, ownerId: string) {
  const item = await prisma.item.findFirst({
    where: { id, wishlist: { ownerId } },
  });
  if (!item) throw new Error('NOT_FOUND');
  await prisma.item.delete({ where: { id } });
}
