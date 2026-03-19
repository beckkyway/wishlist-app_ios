import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as friendsApi from '../api/friends.api';

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: () => friendsApi.getFriends(),
  });
}

export function useIncomingRequests() {
  return useQuery({
    queryKey: ['friends', 'requests', 'incoming'],
    queryFn: () => friendsApi.getIncomingRequests(),
  });
}

export function useOutgoingRequests() {
  return useQuery({
    queryKey: ['friends', 'requests', 'outgoing'],
    queryFn: () => friendsApi.getOutgoingRequests(),
  });
}

export function useSearchUsers(q: string) {
  return useQuery({
    queryKey: ['users', 'search', q],
    queryFn: () => friendsApi.searchUsers(q),
    enabled: q.length >= 2,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receiverId: string) => friendsApi.sendFriendRequest(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', 'requests', 'outgoing'] });
    },
  });
}

export function useRespondToRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: 'accept' | 'decline' }) =>
      friendsApi.respondToRequest(requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friends', 'requests', 'incoming'] });
    },
  });
}

export function useUnfriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => friendsApi.unfriend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}
