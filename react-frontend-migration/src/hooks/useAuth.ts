import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signIn, register, googleAuth, getCurrentUser, updateUser, changePassword } from '@/api';
import { useAppDispatch } from '@/store';
import { setCredentials, setUser, logout as logoutAction } from '@/store/slices/userSlice';
import type { LoginCredentials, RegisterPayload, UpdateUserPayload, ChangePasswordPayload, User, UserSignedIn } from '@/types';

export const USER_QUERY_KEY = 'currentUser';

function transformAuthResponse(data: Record<string, unknown>): UserSignedIn {
  const { accessToken, ...userData } = data;
  return {
    user: userData as unknown as User,
    accessToken: accessToken as string,
  };
}

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: getCurrentUser,
    enabled,
  });
}

export function useSignIn() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => signIn(credentials),
    onSuccess: (response) => {
      if (response.data) {
        const credentials = transformAuthResponse(response.data as unknown as Record<string, unknown>);
        dispatch(setCredentials(credentials));
        queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      }
    },
  });
}

export function useRegister() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (response) => {
      if (response.data) {
        const credentials = transformAuthResponse(response.data as unknown as Record<string, unknown>);
        dispatch(setCredentials(credentials));
        queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      }
    },
  });
}

export function useGoogleAuth() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => googleAuth(token),
    onSuccess: (response) => {
      if (response.data) {
        const credentials = transformAuthResponse(response.data as unknown as Record<string, unknown>);
        dispatch(setCredentials(credentials));
        queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      }
    },
  });
}

export function useUpdateUser() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(payload),
    onSuccess: (response) => {
      if (response.data) {
        dispatch(setUser(response.data));
        queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return () => {
    dispatch(logoutAction());
    queryClient.clear();
  };
}
