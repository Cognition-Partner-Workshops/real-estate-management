import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEnquiries,
  fetchEnquiry,
  createEnquiry,
  markEnquiryAsRead,
  deleteEnquiry,
} from '@/api';
import type { CreateEnquiryPayload } from '@/types';

export const ENQUIRIES_QUERY_KEY = 'enquiries';
export const ENQUIRY_QUERY_KEY = 'enquiry';

export function useEnquiries(enabled = true) {
  return useQuery({
    queryKey: [ENQUIRIES_QUERY_KEY],
    queryFn: fetchEnquiries,
    enabled,
  });
}

export function useEnquiry(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [ENQUIRY_QUERY_KEY, id],
    queryFn: () => fetchEnquiry(id!),
    enabled: enabled && !!id,
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEnquiryPayload) => createEnquiry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENQUIRIES_QUERY_KEY] });
    },
  });
}

export function useMarkEnquiryAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markEnquiryAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [ENQUIRIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ENQUIRY_QUERY_KEY, id] });
    },
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEnquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENQUIRIES_QUERY_KEY] });
    },
  });
}
