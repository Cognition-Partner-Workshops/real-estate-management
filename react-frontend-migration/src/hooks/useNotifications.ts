import { useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, readNotifications, deleteNotification } from '@/api';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setNotifications,
  removeNotificationsFromList,
  markNotificationsAsRead,
  setLoading,
} from '@/store/slices/notificationsSlice';
import type { UserNotification, ApiResponse } from '@/types';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';

interface UseNotificationsReturn {
  notifications: UserNotification[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  markAsRead: (ids: string[]) => Promise<void>;
  deleteNotifications: (ids: string[]) => Promise<ApiResponse<null> | undefined>;
}

export function useNotifications(enabled = true): UseNotificationsReturn {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const isLoadingState = useAppSelector((state) => state.notifications.isLoading);

  const { isFetching, error, refetch } = useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetchNotifications();
      if (response.data) {
        dispatch(setNotifications(response.data));
      }
      return response;
    },
    enabled,
  });

  const readMutation = useMutation({
    mutationFn: (ids: string[]) => readNotifications(ids),
    onSuccess: (response) => {
      if (response.data) {
        const readIds = response.data.map((n) => n.notification_id);
        dispatch(markNotificationsAsRead(readIds));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => {
      return Promise.all(ids.map((id) => deleteNotification(id)));
    },
    onSuccess: (_, ids) => {
      dispatch(removeNotificationsFromList(ids));
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });

  const markAsRead = useCallback(
    async (ids: string[]): Promise<void> => {
      if (ids.length === 0) return;
      await readMutation.mutateAsync(ids);
    },
    [readMutation]
  );

  const deleteNotifications = useCallback(
    async (ids: string[]): Promise<ApiResponse<null> | undefined> => {
      if (ids.length === 0) return undefined;
      dispatch(setLoading(true));
      try {
        await deleteMutation.mutateAsync(ids);
        return { success: true, message: 'Notifications deleted successfully' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete notifications';
        return { success: false, message: errorMessage };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [deleteMutation, dispatch]
  );

  return {
    notifications,
    isLoading: isLoadingState || isFetching,
    isFetching,
    error: error as Error | null,
    refetch,
    markAsRead,
    deleteNotifications,
  };
}

interface UseNotificationReadObserverOptions {
  onRead: (ids: string[]) => void;
  debounceMs?: number;
}

interface UseNotificationReadObserverReturn {
  observeElement: (element: HTMLElement | null, notificationId: string, isRead: boolean) => void;
  cleanup: () => void;
}

export function useNotificationReadObserver({
  onRead,
  debounceMs = 3000,
}: UseNotificationReadObserverOptions): UseNotificationReadObserverReturn {
  const pendingReadsRef = useRef<Set<string>>(new Set());
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingRef = useRef(false);

  const processReads = useCallback((): void => {
    if (pendingReadsRef.current.size === 0 || processingRef.current) {
      return;
    }
    processingRef.current = true;
    const idsToRead = Array.from(pendingReadsRef.current);
    pendingReadsRef.current.clear();
    onRead(idsToRead);
    processingRef.current = false;
  }, [onRead]);

  const scheduleProcessReads = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(processReads, debounceMs);
  }, [processReads, debounceMs]);

  const observeElement = useCallback(
    (element: HTMLElement | null, notificationId: string, isRead: boolean): void => {
      if (!element || isRead) return;

      if (observersRef.current.has(notificationId)) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !pendingReadsRef.current.has(notificationId)) {
            pendingReadsRef.current.add(notificationId);
            scheduleProcessReads();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(element);
      observersRef.current.set(notificationId, observer);
    },
    [scheduleProcessReads]
  );

  const cleanup = useCallback((): void => {
    observersRef.current.forEach((observer) => observer.disconnect());
    observersRef.current.clear();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { observeElement, cleanup };
}
