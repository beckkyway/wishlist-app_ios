import { apiClient } from './client';
import { Contribution, ContributionSummary } from '../types';

export async function createContribution(
  itemId: string,
  amount: number,
  guestName: string,
  guestEmail?: string,
): Promise<Contribution> {
  const res = await apiClient.post<Contribution>('/contributions', { itemId, amount, guestName, guestEmail });
  return res.data;
}

export async function getContributions(itemId: string): Promise<ContributionSummary> {
  const res = await apiClient.get<ContributionSummary>(`/contributions/${itemId}`);
  return res.data;
}
