import { apiClient } from './client';
import { FeedItem } from '../types';

export interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}

export async function getFeed(cursor?: string, limit = 20): Promise<FeedPage> {
  const res = await apiClient.get<FeedPage>('/feed', { params: { cursor, limit } });
  return res.data;
}
