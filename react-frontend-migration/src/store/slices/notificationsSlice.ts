import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserNotification } from '@/types';

interface NotificationsState {
  notifications: UserNotification[];
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
    setNotifications: (state, action: PayloadAction<UserNotification[]>) => {
      state.notifications = action.payload;
      state.initialFetchDone = true;
    },
    addNotificationToList: (state, action: PayloadAction<UserNotification>) => {
      state.notifications = [action.payload, ...state.notifications];
    },
    removeNotificationFromList: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.notification_id !== action.payload
      );
    },
    removeNotificationsFromList: (state, action: PayloadAction<string[]>) => {
      state.notifications = state.notifications.filter(
        (n) => !action.payload.includes(n.notification_id)
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
      state.isLoading = false;
      state.initialFetchDone = false;
    },
  },
});

export const {
  setNotifications,
  addNotificationToList,
  removeNotificationFromList,
  removeNotificationsFromList,
  markNotificationsAsRead,
  setLoading,
  resetState,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
