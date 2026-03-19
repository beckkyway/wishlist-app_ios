import { apiClient } from './client';
import { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export async function register(email: string, password: string, name?: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/register', { email, password, name });
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<User>('/auth/me');
  return res.data;
}
