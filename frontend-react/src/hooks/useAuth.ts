import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  signIn,
  register,
  googleAuth,
  changePassword,
  getCurrentUser,
  updateUser,
} from '@/api';
import { queryKeys } from '@/api/queryClient';
import { useAuthStore, useUIStore, useWebSocketStore } from '@/store';
import type { AuthCredentials, RegisterCredentials, User } from '@/types';

export function useSignIn() {
  const setUser = useAuthStore((state) => state.setUser);
  const connect = useWebSocketStore((state) => state.connect);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => signIn(credentials),
    onSuccess: (data) => {
      setUser(data, data.accessToken);
      connect(data.accessToken);
      addToast({ type: 'success', message: 'Signed in successfully' });
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((state) => state.setUser);
  const connect = useWebSocketStore((state) => state.connect);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),
    onSuccess: (data) => {
      setUser(data, data.accessToken);
      connect(data.accessToken);
      addToast({ type: 'success', message: 'Account created successfully' });
    },
  });
}

export function useGoogleAuth() {
  const setUser = useAuthStore((state) => state.setUser);
  const connect = useWebSocketStore((state) => state.connect);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (payload: { credential: string; clientId: string }) =>
      googleAuth(payload),
    onSuccess: (data) => {
      setUser(data, data.accessToken);
      connect(data.accessToken);
      addToast({ type: 'success', message: 'Signed in with Google' });
    },
  });
}

export function useChangePassword() {
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({
      passwordCurrent,
      passwordNew,
    }: {
      passwordCurrent: string;
      passwordNew: string;
    }) => changePassword(passwordCurrent, passwordNew),
    onSuccess: () => {
      addToast({ type: 'success', message: 'Password changed successfully' });
    },
  });
}

export function useCurrentUser(enabled = true) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.user.details,
    queryFn: getCurrentUser,
    enabled: enabled && isAuthenticated,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const updateUserInStore = useAuthStore((state) => state.updateUser);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (updates: Partial<User>) => updateUser(updates),
    onSuccess: (updatedUser) => {
      updateUserInStore(updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.details });
      addToast({ type: 'success', message: 'Profile updated successfully' });
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const disconnect = useWebSocketStore((state) => state.disconnect);
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return () => {
    disconnect();
    logout();
    queryClient.clear();
    addToast({ type: 'info', message: 'Signed out successfully' });
  };
}
