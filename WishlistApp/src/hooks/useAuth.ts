import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import * as authApi from '../api/auth.api';

export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: data => setAuth(data.token, data.user),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name?: string }) =>
      authApi.register(email, password, name),
    // Navigation to Login is handled in RegisterScreen.onSuccess
  });
}

export function useLogout() {
  const clearAuth = useAuthStore(s => s.clearAuth);
  return clearAuth;
}
