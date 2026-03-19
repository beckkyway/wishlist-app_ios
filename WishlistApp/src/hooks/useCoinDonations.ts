import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as coinDonationsApi from '../api/coinDonations.api';
import { useAuthStore } from '../store/authStore';

export function useItemDonations(itemId: string) {
  return useQuery({
    queryKey: ['coinDonations', itemId],
    queryFn: () => coinDonationsApi.getItemDonations(itemId),
  });
}

export function useDonateCoins() {
  const queryClient = useQueryClient();
  const updateCoinBalance = useAuthStore(s => s.updateCoinBalance);

  return useMutation({
    mutationFn: ({ itemId, amount }: { itemId: string; amount: number }) =>
      coinDonationsApi.donateCoins(itemId, amount),
    onSuccess: (data, { itemId }) => {
      updateCoinBalance(data.newBalance);
      queryClient.invalidateQueries({ queryKey: ['coinDonations', itemId] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
