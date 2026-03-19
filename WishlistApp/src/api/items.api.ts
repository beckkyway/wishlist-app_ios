import { apiClient } from './client';
import { Item, Priority, ItemStatus } from '../types';

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

export async function createItem(data: CreateItemData): Promise<Item> {
  const res = await apiClient.post<Item>('/items', data);
  return res.data;
}

export async function updateItem(id: string, data: UpdateItemData): Promise<Item> {
  const res = await apiClient.patch<Item>(`/items/${id}`, data);
  return res.data;
}

export async function deleteItem(id: string): Promise<void> {
  await apiClient.delete(`/items/${id}`);
}

export async function parseUrl(url: string) {
  const res = await apiClient.post<{ title?: string; imageUrl?: string; price?: number }>('/parse-url', { url });
  return res.data;
}
