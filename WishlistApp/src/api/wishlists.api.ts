import { apiClient } from './client';
import { Wishlist, Item, WishlistVisibility } from '../types';

export async function getWishlists(): Promise<Wishlist[]> {
  const res = await apiClient.get<Wishlist[]>('/wishlists');
  return res.data;
}

export async function createWishlist(
  title: string,
  description?: string,
  occasion?: string,
  occasionDate?: string,
  visibility?: WishlistVisibility,
): Promise<Wishlist> {
  const res = await apiClient.post<Wishlist>('/wishlists', { title, description, occasion, occasionDate, visibility });
  return res.data;
}

export async function getWishlist(id: string): Promise<Wishlist & { items: Item[] }> {
  const res = await apiClient.get<Wishlist & { items: Item[] }>(`/wishlists/${id}`);
  return res.data;
}

export async function updateWishlist(
  id: string,
  data: { title?: string; description?: string; occasion?: string; occasionDate?: string | null; visibility?: WishlistVisibility },
): Promise<Wishlist> {
  const res = await apiClient.patch<Wishlist>(`/wishlists/${id}`, data);
  return res.data;
}

export async function deleteWishlist(id: string): Promise<void> {
  await apiClient.delete(`/wishlists/${id}`);
}
