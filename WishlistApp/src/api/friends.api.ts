import { apiClient } from './client';
import { Friendship, PublicUser } from '../types';

export async function getFriends(): Promise<PublicUser[]> {
  const res = await apiClient.get<PublicUser[]>('/friends');
  return res.data;
}

export async function getIncomingRequests(): Promise<Friendship[]> {
  const res = await apiClient.get<Friendship[]>('/friends/requests/incoming');
  return res.data;
}

export async function getOutgoingRequests(): Promise<Friendship[]> {
  const res = await apiClient.get<Friendship[]>('/friends/requests/outgoing');
  return res.data;
}

export async function sendFriendRequest(receiverId: string): Promise<Friendship> {
  const res = await apiClient.post<Friendship>('/friends/requests', { receiverId });
  return res.data;
}

export async function respondToRequest(
  requestId: string,
  action: 'accept' | 'decline',
): Promise<Friendship> {
  const res = await apiClient.patch<Friendship>(`/friends/requests/${requestId}`, { action });
  return res.data;
}

export async function unfriend(userId: string): Promise<void> {
  await apiClient.delete(`/friends/${userId}`);
}

export async function searchUsers(q: string): Promise<PublicUser[]> {
  const res = await apiClient.get<PublicUser[]>('/friends/search', { params: { q } });
  return res.data;
}
