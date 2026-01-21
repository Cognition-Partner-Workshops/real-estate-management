import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import { addEnquiry, addToast, logout } from '@/store/slices';
import type { Enquiry, Activity, UserNotification, WebSocketNotification } from '@/types';
import { SocketNotificationType } from '@/types';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  messages: string[];
  send: (message: string) => void;
}

interface ActivityPayload extends Activity {
  activity_id: string;
}

interface WebSocketStore {
  socket: WebSocket | null;
  status: ConnectionStatus;
  messages: string[];
  listeners: Set<() => void>;
}

function parseMessage(message: string): WebSocketNotification | string {
  try {
    const parsedMessage = JSON.parse(message) as WebSocketNotification;
    return parsedMessage;
  } catch {
    return message.toString();
  }
}

function isWebSocketNotification(
  message: WebSocketNotification | string
): message is WebSocketNotification {
  return typeof message === 'object' && message !== null && 'type' in message;
}

function createWebSocketStore(): WebSocketStore {
  return {
    socket: null,
    status: 'disconnected',
    messages: [],
    listeners: new Set(),
  };
}

const globalStore = createWebSocketStore();

function notifyListeners(): void {
  globalStore.listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  globalStore.listeners.add(listener);
  return (): void => {
    globalStore.listeners.delete(listener);
  };
}

function getSnapshot(): ConnectionStatus {
  return globalStore.status;
}

function getMessagesSnapshot(): string[] {
  return globalStore.messages;
}

export function useWebSocket(): UseWebSocketReturn {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.user.accessToken);

  const connectionStatus = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const messages = useSyncExternalStore(subscribe, getMessagesSnapshot, getMessagesSnapshot);

  const dispatchRef = useRef(dispatch);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  const handleNotification = useCallback(
    (notification: WebSocketNotification): void => {
      const currentDispatch = dispatchRef.current;
      switch (notification.type) {
        case SocketNotificationType.Activity: {
          const activity = notification.payload as ActivityPayload;
          currentDispatch(
            addToast({
              type: 'info',
              message: activity.description || 'New activity',
            })
          );
          break;
        }

        case SocketNotificationType.Enquiry: {
          const enquiry = notification.payload as Enquiry;
          currentDispatch(addEnquiry(enquiry));
          currentDispatch(
            addToast({
              type: 'info',
              message: `New enquiry: ${enquiry.title}`,
            })
          );
          break;
        }

        case SocketNotificationType.User: {
          const userNotification = notification.payload as UserNotification;
          currentDispatch(
            addToast({
              type: 'info',
              message: userNotification.message,
            })
          );
          break;
        }

        case SocketNotificationType.Logout: {
          currentDispatch(logout());
          currentDispatch(
            addToast({
              type: 'warning',
              message: 'You have been logged out',
            })
          );
          break;
        }

        default: {
          console.error('Unknown notification type:', notification.type);
          break;
        }
      }
    },
    []
  );

  const send = useCallback((message: string): void => {
    if (globalStore.socket?.readyState === WebSocket.OPEN) {
      globalStore.socket.send(message);
    } else {
      console.error('WebSocket connection is not open.');
    }
  }, []);

  useEffect(() => {
    if (!accessToken) {
      if (globalStore.socket) {
        globalStore.socket.close();
        globalStore.socket = null;
        globalStore.status = 'disconnected';
        notifyListeners();
      }
      return;
    }

    if (globalStore.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    globalStore.status = 'connecting';
    notifyListeners();

    const wsUrl = `${WS_BASE_URL}?userToken=${accessToken}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = (): void => {
      console.log('WebSocket connection established.');
      globalStore.status = 'connected';
      notifyListeners();
    };

    socket.onmessage = (event: MessageEvent<string>): void => {
      const message = event.data;
      const parsedMessage = parseMessage(message);

      if (isWebSocketNotification(parsedMessage)) {
        handleNotification(parsedMessage);
      }

      globalStore.messages = [...globalStore.messages, message];
      notifyListeners();
    };

    socket.onclose = (event: CloseEvent): void => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      globalStore.status = 'disconnected';
      globalStore.socket = null;
      notifyListeners();
    };

    socket.onerror = (): void => {
      console.error('WebSocket error occurred');
      globalStore.status = 'error';
      notifyListeners();
    };

    globalStore.socket = socket;

    return (): void => {
      if (globalStore.socket) {
        globalStore.socket.close();
        globalStore.socket = null;
        globalStore.status = 'disconnected';
        notifyListeners();
      }
    };
  }, [accessToken, handleNotification]);

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    messages,
    send,
  };
}
