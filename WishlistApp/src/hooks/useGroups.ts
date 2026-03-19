import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as groupsApi from '../api/groups.api';
import { useAuthStore } from '../store/authStore';

export function useMyGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getMyGroups,
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => groupsApi.getGroup(groupId),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      groupsApi.createGroup(name, description),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (joinCode: string) => groupsApi.joinGroup(joinCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useAddGroupItem(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, description, coinTarget }: { title: string; description?: string; coinTarget?: number }) =>
      groupsApi.addGroupItem(groupId, title, description, coinTarget),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}

export function useDonateToGroupItem(groupId: string) {
  const queryClient = useQueryClient();
  const updateCoinBalance = useAuthStore(s => s.updateCoinBalance);
  return useMutation({
    mutationFn: ({ itemId, amount }: { itemId: string; amount: number }) =>
      groupsApi.donateToGroupItem(groupId, itemId, amount),
    onSuccess: (data) => {
      updateCoinBalance(data.newBalance);
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });
}
