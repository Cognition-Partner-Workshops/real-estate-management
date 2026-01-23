import { apiClient } from './client';
import type {
  UserSignedIn,
  UserDetails,
  User,
  AuthCredentials,
  RegisterCredentials,
  ApiResponse,
} from '@/types';

export async function signIn(credentials: AuthCredentials): Promise<UserSignedIn> {
  const response = await apiClient.post<ApiResponse<UserSignedIn>>(
    '/auth/signin',
    credentials
  );
  return response.data.data;
}

export async function register(credentials: RegisterCredentials): Promise<UserSignedIn> {
  const response = await apiClient.post<ApiResponse<UserSignedIn>>(
    '/auth/register',
    credentials
  );
  return response.data.data;
}

export async function googleAuth(payload: {
  credential: string;
  clientId: string;
}): Promise<UserSignedIn> {
  const response = await apiClient.post<ApiResponse<UserSignedIn>>(
    '/auth/google',
    payload
  );
  return response.data.data;
}

export async function changePassword(
  passwordCurrent: string,
  passwordNew: string
): Promise<void> {
  await apiClient.post('/auth/change-password', {
    passwordCurrent,
    passwordNew,
  });
}

export async function getCurrentUser(): Promise<UserDetails> {
  const response = await apiClient.get<ApiResponse<UserDetails>>('/users/me');
  return response.data.data;
}

export async function updateUser(updates: Partial<User>): Promise<User> {
  const response = await apiClient.patch<ApiResponse<User>>('/users/me', updates);
  return response.data.data;
}
