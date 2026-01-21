export { default as userReducer } from './userSlice';
export { default as propertiesReducer } from './propertiesSlice';
export { default as enquiriesReducer } from './enquiriesSlice';
export { default as uiReducer } from './uiSlice';
export { default as notificationsReducer } from './notificationsSlice';
export { default as activitiesReducer } from './activitiesSlice';

export {
  setCredentials,
  setUser,
  setLoading as setUserLoading,
  setError as setUserError,
  clearError as clearUserError,
  logout,
  signIn,
  register,
  googleAuth,
  getCurrentUser,
  updateUser,
  changePassword,
  selectUser,
  selectAccessToken,
  selectIsAuthenticated,
  selectIsLoading as selectUserIsLoading,
  selectError as selectUserError,
  selectIsPropertyOwner,
} from './userSlice';

export {
  setProperties,
  appendProperties,
  setOwnedProperties,
  setSelectedProperty,
  addProperty,
  updateProperty,
  removeProperty,
  updatePropertyImages,
  setLoading as setPropertiesLoading,
  setHasMore,
  setCursors,
  setFilters,
  setSort,
  setSearch,
  setError as setPropertiesError,
  clearError as clearPropertiesError,
  resetState as resetPropertiesState,
  resetFullState as resetPropertiesFullState,
  fetchPropertiesThunk,
  fetchPropertyThunk,
  fetchOwnedPropertiesThunk,
  createPropertyThunk,
  updatePropertyThunk,
  deletePropertyThunk,
  uploadPropertyImagesThunk,
  deletePropertyImagesThunk,
  selectProperties,
  selectOwnedProperties,
  selectSelectedProperty,
  selectPropertiesLoading,
  selectPropertiesLoadingMore,
  selectPropertiesHasMore,
  selectPropertiesCursors,
  selectPropertiesFilters,
  selectPropertiesSort,
  selectPropertiesSearch,
  selectPropertiesError,
} from './propertiesSlice';

export {
  setEnquiries,
  setSelectedEnquiry,
  addEnquiry,
  updateEnquiry,
  removeEnquiry,
  markAsRead,
  setLoading as setEnquiriesLoading,
  setError as setEnquiriesError,
  clearError as clearEnquiriesError,
  resetState as resetEnquiriesState,
  fetchEnquiries,
  fetchEnquiry,
  createEnquiry,
  deleteEnquiry,
  readEnquiry,
  selectEnquiries,
  selectSelectedEnquiry,
  selectEnquiriesLoading,
  selectEnquiriesError,
  selectInitialFetchDone,
  selectUnreadEnquiriesCount,
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
  addNotificationToList,
  removeNotificationFromList,
  removeNotificationsFromList,
  markNotificationsAsRead,
  setLoading as setNotificationsLoading,
  resetState as resetNotificationsState,
} from './notificationsSlice';

export {
  fetchActivities,
  setActivities,
  insertActivity,
  setLoading as setActivitiesLoading,
  setError as setActivitiesError,
  resetState as resetActivitiesState,
  selectActivities,
  selectActivitiesLoading,
  selectActivitiesError,
} from './activitiesSlice';
