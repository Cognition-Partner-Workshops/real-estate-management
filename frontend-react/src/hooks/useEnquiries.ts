import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEnquiries,
  fetchEnquiry,
  createEnquiry,
  markEnquiryAsRead,
  deleteEnquiry,
} from '@/api';
import { queryKeys } from '@/api/queryClient';
import { useEnquiriesStore, useUIStore } from '@/store';
import type { EnquiryCreate } from '@/types';

export function useEnquiries(enabled = true) {
  const setEnquiries = useEnquiriesStore((state) => state.setEnquiries);
  const setInitialFetchDone = useEnquiriesStore((state) => state.setInitialFetchDone);

  return useQuery({
    queryKey: queryKeys.enquiries.lists(),
    queryFn: async () => {
      const data = await fetchEnquiries();
      setEnquiries(data);
      setInitialFetchDone(true);
      return data;
    },
    enabled,
  });
}

export function useEnquiry(id: string | undefined, enabled = true) {
  const setCurrentEnquiry = useEnquiriesStore((state) => state.setCurrentEnquiry);

  return useQuery({
    queryKey: queryKeys.enquiries.detail(id!),
    queryFn: async () => {
      const data = await fetchEnquiry(id!);
      setCurrentEnquiry(data);
      return data;
    },
    enabled: enabled && !!id,
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();
  const addEnquiry = useEnquiriesStore((state) => state.addEnquiry);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (enquiry: EnquiryCreate) => createEnquiry(enquiry),
    onSuccess: (newEnquiry) => {
      addEnquiry(newEnquiry);
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
      addToast({ type: 'success', message: 'Enquiry sent successfully' });
    },
  });
}

export function useMarkEnquiryAsRead() {
  const queryClient = useQueryClient();
  const markAsRead = useEnquiriesStore((state) => state.markAsRead);

  return useMutation({
    mutationFn: (id: string) => markEnquiryAsRead(id),
    onSuccess: (_, id) => {
      markAsRead(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.detail(id) });
    },
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();
  const removeEnquiry = useEnquiriesStore((state) => state.removeEnquiry);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: deleteEnquiry,
    onMutate: async (enquiryId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.enquiries.all });
      const previousEnquiries = queryClient.getQueryData(
        queryKeys.enquiries.lists()
      );
      removeEnquiry(enquiryId);
      return { previousEnquiries };
    },
    onError: (_err, _enquiryId, context) => {
      if (context?.previousEnquiries) {
        queryClient.setQueryData(
          queryKeys.enquiries.lists(),
          context.previousEnquiries
        );
      }
      addToast({ type: 'error', message: 'Failed to delete enquiry' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
    },
    onSuccess: () => {
      addToast({ type: 'success', message: 'Enquiry deleted successfully' });
    },
  });
}
