import prisma from '../db';

export async function createReservation(itemId: string, guestName: string, guestEmail?: string) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { reservation: true },
  });
  if (!item) throw new Error('NOT_FOUND');
  if (item.reservation) throw new Error('ALREADY_RESERVED');
  if (item.status !== 'AVAILABLE') throw new Error('NOT_AVAILABLE');

  const reservation = await prisma.reservation.create({
    data: { itemId, guestName, guestEmail },
  });

  await prisma.item.update({ where: { id: itemId }, data: { status: 'RESERVED' } });

  return reservation;
}

export async function deleteReservation(id: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) throw new Error('NOT_FOUND');

  await prisma.reservation.delete({ where: { id } });
  await prisma.item.update({ where: { id: reservation.itemId }, data: { status: 'AVAILABLE' } });
}
