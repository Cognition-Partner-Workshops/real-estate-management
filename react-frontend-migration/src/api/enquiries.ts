import apiClient from './client';
import type { ApiResponse, Enquiry, CreateEnquiryPayload } from '@/types';

export async function fetchEnquiries(): Promise<ApiResponse<Enquiry[]>> {
  const response = await apiClient.get<ApiResponse<Enquiry[]>>('/enquiries');
  return response.data;
}

export async function fetchEnquiry(id: string): Promise<ApiResponse<Enquiry>> {
  const response = await apiClient.get<ApiResponse<Enquiry>>(`/enquiries/${id}`);
  return response.data;
}

export async function createEnquiry(payload: CreateEnquiryPayload): Promise<ApiResponse<Enquiry>> {
  const response = await apiClient.post<ApiResponse<Enquiry>>('/enquiries', payload);
  return response.data;
}

export async function markEnquiryAsRead(id: string): Promise<ApiResponse<Enquiry>> {
  const response = await apiClient.patch<ApiResponse<Enquiry>>(`/enquiries/${id}`, { read: true });
  return response.data;
}

export async function deleteEnquiry(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/enquiries/${id}`);
  return response.data;
}
