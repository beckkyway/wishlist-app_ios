import { apiClient } from './client';
import { GiftSuggestion } from '../types';

export interface AISuggestInput {
  occasion: string;
  budget: string;
  interests: string;
  recipientType: string;
}

export async function suggestGifts(input: AISuggestInput): Promise<GiftSuggestion[]> {
  const res = await apiClient.post<{ suggestions: GiftSuggestion[] }>('/ai/suggest', input);
  return res.data.suggestions;
}
