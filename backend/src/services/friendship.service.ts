import prisma from '../db';

/** Returns IDs of all accepted friends for a given user */
export async function getFriendIds(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    select: { senderId: true, receiverId: true },
  });

  return friendships.map(f => (f.senderId === userId ? f.receiverId : f.senderId));
}

export async function areFriends(userA: string, userB: string): Promise<boolean> {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    },
  });
  return !!friendship;
}

export async function sendRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) throw new Error('CANNOT_ADD_SELF');

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });
  if (existing) throw new Error('ALREADY_EXISTS');

  return prisma.friendship.create({
    data: { senderId, receiverId },
    include: {
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function respondToRequest(
  requestId: string,
  receiverId: string,
  action: 'accept' | 'decline',
) {
  const request = await prisma.friendship.findFirst({
    where: { id: requestId, receiverId, status: 'PENDING' },
  });
  if (!request) throw new Error('NOT_FOUND');

  return prisma.friendship.update({
    where: { id: requestId },
    data: { status: action === 'accept' ? 'ACCEPTED' : 'DECLINED' },
  });
}

export async function unfriend(userId: string, otherUserId: string) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
  });
  if (!friendship) throw new Error('NOT_FOUND');
  await prisma.friendship.delete({ where: { id: friendship.id } });
}

export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
      receiver: { select: { id: true, name: true, avatarUrl: true, role: true } },
    },
  });

  return friendships.map(f => (f.senderId === userId ? f.receiver : f.sender));
}

export async function getIncomingRequests(receiverId: string) {
  return prisma.friendship.findMany({
    where: { receiverId, status: 'PENDING' },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOutgoingRequests(senderId: string) {
  return prisma.friendship.findMany({
    where: { senderId, status: 'PENDING' },
    include: {
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFriendWishlists(requestingUserId: string, friendUserId: string) {
  const friends = await areFriends(requestingUserId, friendUserId);

  return prisma.wishlist.findMany({
    where: {
      ownerId: friendUserId,
      visibility: friends ? { in: ['FRIENDS', 'PUBLIC'] } : 'PUBLIC',
    },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { items: true } } },
  });
}

export async function searchUsers(query: string, excludeUserId: string) {
  return prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
    take: 20,
  });
}
