import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as wishlistsApi from '../api/wishlists.api';

export function useWishlists() {
  return useQuery({
    queryKey: ['wishlists'],
    queryFn: wishlistsApi.getWishlists,
  });
}

export function useCreateWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      description,
      occasion,
      occasionDate,
      visibility,
    }: {
      title: string;
      description?: string;
      occasion?: string;
      occasionDate?: string;
      visibility?: import('../types').WishlistVisibility;
    }) => wishlistsApi.createWishlist(title, description, occasion, occasionDate, visibility),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlists'] }),
  });
}

export function useDeleteWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wishlistsApi.deleteWishlist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlists'] }),
  });
}
