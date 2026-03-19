import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateCoinBalance: (balance: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      updateCoinBalance: (balance) =>
        set(state => ({
          user: state.user ? { ...state.user, coinBalance: balance } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
