import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store';
import type { ApiResponse, ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return response.data;
}

export function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
