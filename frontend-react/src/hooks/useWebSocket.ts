import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useWebSocketStore, useEnquiriesStore, useUIStore } from '@/store';
import { queryKeys } from '@/api/queryClient';
import { SocketNotificationType } from '@/types';
import type { Enquiry, Activity, UserNotification, WebSocketNotification } from '@/types';

export function useWebSocket() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const { status, connect, disconnect, messages } = useWebSocketStore();
  const addEnquiry = useEnquiriesStore((state) => state.addEnquiry);
  const addToast = useUIStore((state) => state.addToast);
  const queryClient = useQueryClient();

  const handleNotification = useCallback(
    (notification: WebSocketNotification) => {
      switch (notification.type) {
        case SocketNotificationType.Activity: {
          const activity = notification.payload as Activity;
          queryClient.invalidateQueries({ queryKey: queryKeys.user.activities });
          addToast({
            type: 'info',
            message: activity.description || 'New activity',
          });
          break;
        }

        case SocketNotificationType.Enquiry: {
          const enquiry = notification.payload as Enquiry;
          addEnquiry(enquiry);
          queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
          addToast({
            type: 'info',
            message: `New enquiry: ${enquiry.title}`,
          });
          break;
        }

        case SocketNotificationType.User: {
          const userNotification = notification.payload as UserNotification;
          queryClient.invalidateQueries({ queryKey: queryKeys.user.notifications });
          addToast({
            type: 'info',
            message: userNotification.message,
          });
          break;
        }

        case SocketNotificationType.Logout: {
          logout();
          queryClient.clear();
          addToast({
            type: 'warning',
            message: 'You have been logged out',
          });
          break;
        }

        default:
          console.error('Unknown notification type:', notification.type);
      }
    },
    [addEnquiry, addToast, logout, queryClient]
  );

  useEffect(() => {
    if (accessToken && status === 'disconnected') {
      connect(accessToken);
    }

    return () => {
      if (status === 'connected') {
        disconnect();
      }
    };
  }, [accessToken, status, connect, disconnect]);

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      handleNotification(latestMessage);
    }
  }, [messages, handleNotification]);

  return {
    isConnected: status === 'connected',
    connectionStatus: status,
  };
}
