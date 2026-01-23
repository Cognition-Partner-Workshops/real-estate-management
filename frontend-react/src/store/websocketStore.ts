import { create } from 'zustand';
import type { ConnectionStatus, WebSocketNotification, SocketNotificationType } from '@/types';

interface WebSocketState {
  socket: WebSocket | null;
  status: ConnectionStatus;
  messages: WebSocketNotification[];
  connect: (token: string, baseUrl?: string) => void;
  disconnect: () => void;
  send: (message: string) => void;
  addMessage: (message: WebSocketNotification) => void;
  clearMessages: () => void;
}

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  status: 'disconnected',
  messages: [],

  connect: (token, baseUrl = WS_BASE_URL) => {
    const currentSocket = get().socket;
    if (currentSocket?.readyState === WebSocket.OPEN) {
      return;
    }

    set({ status: 'connecting' });

    const wsUrl = `${baseUrl}?userToken=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established.');
      set({ status: 'connected' });
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const parsedMessage = JSON.parse(event.data) as WebSocketNotification;
        get().addMessage(parsedMessage);
      } catch {
        console.error('Failed to parse WebSocket message:', event.data);
      }
    };

    socket.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      set({ status: 'disconnected', socket: null });
    };

    socket.onerror = () => {
      console.error('WebSocket error occurred');
      set({ status: 'error' });
    };

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, status: 'disconnected' });
    }
  },

  send: (message) => {
    const { socket } = get();
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      console.error('WebSocket connection is not open.');
    }
  },

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearMessages: () => set({ messages: [] }),
}));

export function parseSocketNotificationType(type: string): SocketNotificationType | null {
  const validTypes: SocketNotificationType[] = ['ACTIVITY', 'ENQUIRY', 'USER_LOGOUT', 'USER'] as SocketNotificationType[];
  return validTypes.includes(type as SocketNotificationType) ? (type as SocketNotificationType) : null;
}
