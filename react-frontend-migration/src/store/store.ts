import { configureStore } from '@reduxjs/toolkit';
import {
  authReducer,
  propertiesReducer,
  enquiriesReducer,
  uiReducer,
  notificationsReducer,
  activitiesReducer,
} from './slices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    enquiries: enquiriesReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    activities: activitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
