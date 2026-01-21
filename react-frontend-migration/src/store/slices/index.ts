export { default as authReducer } from './authSlice';
export { default as propertiesReducer } from './propertiesSlice';
export { default as enquiriesReducer } from './enquiriesSlice';
export { default as uiReducer } from './uiSlice';
export { default as notificationsReducer } from './notificationsSlice';

export {
  setCredentials,
  setUser,
  setLoading as setAuthLoading,
  logout,
} from './authSlice';

export {
  setProperties,
  appendProperties,
  setOwnedProperties,
  setSelectedProperty,
  addProperty,
  updateProperty,
  removeProperty,
  setLoading as setPropertiesLoading,
  setHasMore,
  setCursors,
  setFilters,
  setSort,
  setSearch,
  resetState as resetPropertiesState,
} from './propertiesSlice';

export {
  setEnquiries,
  setSelectedEnquiry,
  addEnquiry,
  updateEnquiry,
  removeEnquiry,
  markAsRead,
  setLoading as setEnquiriesLoading,
  resetState as resetEnquiriesState,
} from './enquiriesSlice';

export {
  setDarkMode,
  toggleDarkMode,
  setSidebarOpen,
  toggleSidebar,
  addNotification as addToast,
  removeNotification as removeToast,
  clearNotifications as clearToasts,
} from './uiSlice';

export {
  setNotifications,
  addNotification,
  removeNotifications,
  markNotificationsAsRead,
  setLoading as setNotificationsLoading,
  resetState as resetNotificationsState,
} from './notificationsSlice';
