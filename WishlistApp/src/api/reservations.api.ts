import { apiClient } from './client';
import { Reservation } from '../types';

export async function createReservation(itemId: string, guestName: string, guestEmail?: string): Promise<Reservation> {
  const res = await apiClient.post<Reservation>('/reservations', { itemId, guestName, guestEmail });
  return res.data;
}

export async function deleteReservation(id: string): Promise<void> {
  await apiClient.delete(`/reservations/${id}`);
}
