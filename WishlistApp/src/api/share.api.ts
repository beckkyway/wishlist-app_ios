import { apiClient } from './client';
import { SharedWishlist, Item } from '../types';

export async function getSharedWishlist(token: string): Promise<SharedWishlist> {
  const res = await apiClient.get<SharedWishlist>(`/share/${token}`);
  return res.data;
}

export async function getSharedItems(token: string): Promise<Item[]> {
  const res = await apiClient.get<Item[]>(`/share/${token}/items`);
  return res.data;
}
