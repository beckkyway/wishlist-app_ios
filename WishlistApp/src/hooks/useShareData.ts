import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as shareApi from '../api/share.api';
import * as reservationsApi from '../api/reservations.api';
import * as contributionsApi from '../api/contributions.api';

export function useSharedWishlist(token: string) {
  return useQuery({
    queryKey: ['share', token],
    queryFn: () => shareApi.getSharedWishlist(token),
    enabled: !!token,
  });
}

export function useSharedItems(token: string) {
  return useQuery({
    queryKey: ['shareItems', token],
    queryFn: () => shareApi.getSharedItems(token),
    enabled: !!token,
  });
}

export function useReserveItem(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, guestName, guestEmail }: { itemId: string; guestName: string; guestEmail?: string }) =>
      reservationsApi.createReservation(itemId, guestName, guestEmail),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shareItems', token] }),
  });
}

export function useCancelReservation(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.deleteReservation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shareItems', token] }),
  });
}

export function useContribute(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      amount,
      guestName,
      guestEmail,
    }: {
      itemId: string;
      amount: number;
      guestName: string;
      guestEmail?: string;
    }) => contributionsApi.createContribution(itemId, amount, guestName, guestEmail),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shareItems', token] }),
  });
}
