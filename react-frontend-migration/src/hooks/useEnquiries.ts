import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEnquiries,
  fetchEnquiry,
  createEnquiry,
  markEnquiryAsRead,
  deleteEnquiry,
} from '@/api';
import type { CreateEnquiryPayload, Enquiry } from '@/types';

export const ENQUIRIES_QUERY_KEY = 'enquiries';
export const ENQUIRY_QUERY_KEY = 'enquiry';

export function useEnquiries(enabled = true) {
  return useQuery({
    queryKey: [ENQUIRIES_QUERY_KEY],
    queryFn: fetchEnquiries,
    enabled,
    select: (response) => response.data,
  });
}

export function useEnquiry(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [ENQUIRY_QUERY_KEY, id],
    queryFn: () => fetchEnquiry(id!),
    enabled: enabled && !!id,
    select: (response) => response.data,
  });
}

export function useRelatedEnquiries(
  propertyId: string | undefined,
  currentEnquiryId: string | undefined,
  enquiries: Enquiry[] | undefined
): Enquiry[] {
  if (!propertyId || !enquiries) return [];
  return enquiries.filter(
    (enq) =>
      enq.property.property_id === propertyId &&
      (!currentEnquiryId || enq.enquiry_id !== currentEnquiryId)
  );
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
