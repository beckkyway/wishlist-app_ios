import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clear auth on 401
apiClient.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  },
);
