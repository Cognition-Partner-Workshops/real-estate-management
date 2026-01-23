import { QueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        useUIStore.getState().addToast({ type: 'error', message });
      },
    },
  },
});

export const queryKeys = {
  properties: {
    all: ['properties'] as const,
    lists: () => [...queryKeys.properties.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.properties.lists(), filters] as const,
    details: () => [...queryKeys.properties.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.properties.details(), id] as const,
    owned: () => [...queryKeys.properties.all, 'owned'] as const,
  },
  enquiries: {
    all: ['enquiries'] as const,
    lists: () => [...queryKeys.enquiries.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.enquiries.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.enquiries.all, 'detail', id] as const,
  },
  user: {
    current: ['user', 'current'] as const,
    details: ['user', 'details'] as const,
    notifications: ['user', 'notifications'] as const,
    activities: ['user', 'activities'] as const,
  },
};
