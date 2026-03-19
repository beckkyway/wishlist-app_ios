import { apiClient } from './client';
import { ItemDonations } from '../types';

export async function donateCoins(
  itemId: string,
  amount: number,
): Promise<{ newBalance: number }> {
  const res = await apiClient.post<{ newBalance: number }>('/coin-donations', { itemId, amount });
  return res.data;
}

export async function getItemDonations(itemId: string): Promise<ItemDonations> {
  const res = await apiClient.get<ItemDonations>(`/coin-donations/item/${itemId}`);
  return res.data;
}
