import apiClient from './client';
import type {
  ApiResponse,
  UserSignedIn,
  LoginCredentials,
  RegisterPayload,
  User,
  UpdateUserPayload,
  ChangePasswordPayload,
} from '@/types';

export async function signIn(credentials: LoginCredentials): Promise<ApiResponse<UserSignedIn>> {
  const response = await apiClient.post<ApiResponse<UserSignedIn>>('/auth/signin', credentials);
  return response.data;
}

export async function register(payload: RegisterPayload): Promise<ApiResponse<UserSignedIn>> {
  const response = await apiClient.post<ApiResponse<UserSignedIn>>('/auth/register', payload);
  return response.data;
}

export async function googleAuth(token: string): Promise<ApiResponse<UserSignedIn>> {
  const response = await apiClient.post<ApiResponse<UserSignedIn>>('/auth/google', { token });
  return response.data;
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const response = await apiClient.get<ApiResponse<User>>('/users/me');
  return response.data;
}

export async function updateUser(payload: UpdateUserPayload): Promise<ApiResponse<User>> {
  const response = await apiClient.patch<ApiResponse<User>>('/users/me', payload);
  return response.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<void>> {
  const response = await apiClient.post<ApiResponse<void>>('/users/me/password', payload);
  return response.data;
}
