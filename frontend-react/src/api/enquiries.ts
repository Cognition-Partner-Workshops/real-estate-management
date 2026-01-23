import { apiClient } from './client';
import type { Enquiry, EnquiryCreate, ApiResponse } from '@/types';

export async function fetchEnquiries(): Promise<Enquiry[]> {
  const response = await apiClient.get<ApiResponse<Enquiry[]>>('/enquiries');
  return response.data.data;
}

export async function fetchEnquiry(id: string): Promise<Enquiry> {
  const response = await apiClient.get<ApiResponse<Enquiry>>(`/enquiries/${id}`);
  return response.data.data;
}

export async function createEnquiry(enquiry: EnquiryCreate): Promise<Enquiry> {
  const response = await apiClient.post<ApiResponse<Enquiry>>(
    '/enquiries',
    enquiry
  );
  return response.data.data;
}

export async function markEnquiryAsRead(id: string): Promise<Enquiry> {
  const response = await apiClient.patch<ApiResponse<Enquiry>>(
    `/enquiries/${id}`,
    { read: true }
  );
  return response.data.data;
}

export async function deleteEnquiry(id: string): Promise<void> {
  await apiClient.delete(`/enquiries/${id}`);
}
