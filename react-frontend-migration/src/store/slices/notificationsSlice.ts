import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/types';

interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  initialFetchDone: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  isLoading: false,
  initialFetchDone: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.initialFetchDone = true;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications = [action.payload, ...state.notifications];
    },
    removeNotifications: (state, action: PayloadAction<string[]>) => {
      state.notifications = state.notifications.filter(
        (notification) => !action.payload.includes(notification.notification_id)
      );
    },
    markNotificationsAsRead: (state, action: PayloadAction<string[]>) => {
      state.notifications = state.notifications.map((notification) =>
        action.payload.includes(notification.notification_id)
          ? { ...notification, read: true }
          : notification
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetState: (state) => {
      state.notifications = [];
      state.initialFetchDone = false;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  removeNotifications,
  markNotificationsAsRead,
  setLoading,
  resetState,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
