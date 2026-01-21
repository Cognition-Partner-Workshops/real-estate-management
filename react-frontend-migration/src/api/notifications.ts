import { apiClient } from './client';
import type { ApiResponse, UserNotification } from '@/types';

export async function fetchNotifications(): Promise<ApiResponse<UserNotification[]>> {
  const response = await apiClient.get<ApiResponse<UserNotification[]>>('/notifications');
  return response.data;
}

export async function readNotifications(ids: string[]): Promise<ApiResponse<UserNotification[]>> {
  const response = await apiClient.patch<ApiResponse<UserNotification[]>>('/notifications', { id: ids });
  return response.data;
}

export async function deleteNotification(id: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>('/notifications', {
    data: { id },
  });
  return response.data;
}
