import prisma from '../db';

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createGroup(userId: string, name: string, description?: string) {
  const joinCode = generateJoinCode();
  return prisma.group.create({
    data: {
      name,
      description,
      joinCode,
      creatorId: userId,
      memberships: {
        create: { userId, isAdmin: true },
      },
    },
    select: {
      id: true, name: true, description: true, joinCode: true, createdAt: true,
      _count: { select: { memberships: true, items: true } },
    },
  });
}

export async function joinGroup(userId: string, joinCode: string) {
  const group = await prisma.group.findUnique({ where: { joinCode } });
  if (!group) throw new Error('GROUP_NOT_FOUND');

  const existing = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId: group.id } },
  });
  if (existing) throw new Error('ALREADY_MEMBER');

  await prisma.groupMembership.create({
    data: { userId, groupId: group.id, isAdmin: false },
  });
  return group;
}

export async function getMyGroups(userId: string) {
  const memberships = await prisma.groupMembership.findMany({
    where: { userId },
    include: {
      group: {
        select: {
          id: true, name: true, description: true, createdAt: true,
          _count: { select: { memberships: true, items: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });
  return memberships.map(m => ({ ...m.group, isAdmin: m.isAdmin }));
}

export async function getGroup(userId: string, groupId: string) {
  const membership = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (!membership) throw new Error('NOT_MEMBER');

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      items: {
        include: { donations: { select: { amount: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!group) throw new Error('GROUP_NOT_FOUND');

  return {
    ...group,
    isAdmin: membership.isAdmin,
    items: group.items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      coinTarget: item.coinTarget,
      coinDonationTotal: item.donations.reduce((s, d) => s + d.amount, 0),
      createdAt: item.createdAt,
    })),
  };
}

export async function addGroupItem(
  userId: string,
  groupId: string,
  title: string,
  description?: string,
  coinTarget?: number,
  imageUrl?: string,
) {
  const membership = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (!membership || !membership.isAdmin) throw new Error('FORBIDDEN');

  return prisma.groupItem.create({
    data: { groupId, title, description, coinTarget, imageUrl },
  });
}

export async function donateToGroupItem(userId: string, itemId: string, amount: number) {
  if (amount < 1 || !Number.isInteger(amount)) throw new Error('INVALID_AMOUNT');

  const item = await prisma.groupItem.findUnique({
    where: { id: itemId },
    select: { id: true, title: true, groupId: true },
  });
  if (!item) throw new Error('ITEM_NOT_FOUND');

  const membership = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId: item.groupId } },
  });
  if (!membership) throw new Error('NOT_MEMBER');

  return prisma.$transaction(async (tx) => {
    const donor = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { coinBalance: true },
    });
    if (donor.coinBalance < amount) throw new Error('INSUFFICIENT_BALANCE');

    await tx.user.update({ where: { id: userId }, data: { coinBalance: { decrement: amount } } });

    await tx.coinTransaction.create({
      data: {
        ownerId: userId,
        amount: -amount,
        type: 'DONATED',
        description: `Донат в группу: "${item.title}"`,
      },
    });

    await tx.groupDonation.create({
      data: { donorId: userId, itemId, amount },
    });

    const updated = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { coinBalance: true } });
    return { newBalance: updated.coinBalance };
  });
}
