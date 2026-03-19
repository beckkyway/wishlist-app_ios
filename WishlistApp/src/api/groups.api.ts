import { apiClient } from './client';
import { Group, GroupDetail } from '../types';

export async function getMyGroups(): Promise<Group[]> {
  const res = await apiClient.get<Group[]>('/groups');
  return res.data;
}

export async function createGroup(name: string, description?: string): Promise<Group> {
  const res = await apiClient.post<Group>('/groups', { name, description });
  return res.data;
}

export async function joinGroup(joinCode: string): Promise<Group> {
  const res = await apiClient.post<Group>('/groups/join', { joinCode });
  return res.data;
}

export async function getGroup(groupId: string): Promise<GroupDetail> {
  const res = await apiClient.get<GroupDetail>(`/groups/${groupId}`);
  return res.data;
}

export async function addGroupItem(
  groupId: string,
  title: string,
  description?: string,
  coinTarget?: number,
): Promise<void> {
  await apiClient.post(`/groups/${groupId}/items`, { title, description, coinTarget });
}

export async function donateToGroupItem(
  groupId: string,
  itemId: string,
  amount: number,
): Promise<{ newBalance: number }> {
  const res = await apiClient.post<{ newBalance: number }>(`/groups/${groupId}/items/${itemId}/donate`, { amount });
  return res.data;
}
