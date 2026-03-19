import { apiClient } from './client';
import { CoinTransaction } from '../types';

export interface WalletInfo {
  balance: number;
}

export interface TransactionsPage {
  items: CoinTransaction[];
  nextCursor: string | null;
}

export async function getWallet(): Promise<WalletInfo> {
  const res = await apiClient.get<WalletInfo>('/wallet');
  return res.data;
}

export async function getTransactions(cursor?: string): Promise<TransactionsPage> {
  const res = await apiClient.get<TransactionsPage>('/wallet/transactions', { params: { cursor } });
  return res.data;
}

export async function sendCoins(
  toUserId: string,
  amount: number,
  note?: string,
): Promise<{ newBalance: number }> {
  const res = await apiClient.post<{ newBalance: number }>('/wallet/send', { toUserId, amount, note });
  return res.data;
}

export async function depositCoins(amount: number): Promise<{ newBalance: number }> {
  const res = await apiClient.post<{ newBalance: number }>('/wallet/deposit', { amount });
  return res.data;
}
