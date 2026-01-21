import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let getAccessToken: (() => string | null) | null = null;

export function setTokenGetter(getter: () => string | null): void {
  getAccessToken = getter;
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (getAccessToken) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Transform backend response to match ApiResponse interface
    // Backend returns { status: 200, statusCode: 200, message: "...", data: {...} }
    // Frontend expects { success: boolean, data?: T, message?: string, error?: string }
    if (response.data && typeof response.data === 'object') {
      const backendResponse = response.data as { status?: number; statusCode?: number; message?: string; data?: unknown };
      if (backendResponse.status !== undefined || backendResponse.statusCode !== undefined) {
        const statusCode = backendResponse.status || backendResponse.statusCode || 500;
        response.data = {
          success: statusCode >= 200 && statusCode < 300,
          data: backendResponse.data,
          message: backendResponse.message,
        };
      }
    }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error,
    };
    return Promise.reject(apiError);
  }
);

export default apiClient;
