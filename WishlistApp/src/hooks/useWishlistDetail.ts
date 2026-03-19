import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as wishlistsApi from '../api/wishlists.api';
import * as itemsApi from '../api/items.api';
import { Priority, ItemStatus } from '../types';

export function useWishlistDetail(id: string) {
  return useQuery({
    queryKey: ['wishlist', id],
    queryFn: () => wishlistsApi.getWishlist(id),
    enabled: !!id,
  });
}

interface CreateItemInput {
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

export function useCreateItem(wishlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateItemInput) => itemsApi.createItem(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist', wishlistId] }),
  });
}

interface UpdateItemInput {
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

export function useUpdateItem(wishlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemInput }) => itemsApi.updateItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist', wishlistId] }),
  });
}

export function useDeleteItem(wishlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemsApi.deleteItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist', wishlistId] }),
  });
}
