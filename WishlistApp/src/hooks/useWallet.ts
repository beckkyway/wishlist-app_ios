import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as walletApi from '../api/wallet.api';
import { useAuthStore } from '../store/authStore';

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet(),
  });
}

export function useTransactions() {
  return useInfiniteQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: ({ pageParam }) => walletApi.getTransactions(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useSendCoins() {
  const queryClient = useQueryClient();
  const updateCoinBalance = useAuthStore(s => s.updateCoinBalance);

  return useMutation({
    mutationFn: ({ toUserId, amount, note }: { toUserId: string; amount: number; note?: string }) =>
      walletApi.sendCoins(toUserId, amount, note),
    onSuccess: (data) => {
      updateCoinBalance(data.newBalance);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });
}

export function useDepositCoins() {
  const queryClient = useQueryClient();
  const updateCoinBalance = useAuthStore(s => s.updateCoinBalance);

  return useMutation({
    mutationFn: (amount: number) => walletApi.depositCoins(amount),
    onSuccess: (data) => {
      updateCoinBalance(data.newBalance);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });
}
