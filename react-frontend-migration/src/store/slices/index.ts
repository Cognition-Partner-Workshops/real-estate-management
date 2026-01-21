export { default as userReducer } from './userSlice';
export { default as propertiesReducer } from './propertiesSlice';
export { default as enquiriesReducer } from './enquiriesSlice';
export { default as uiReducer } from './uiSlice';

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
  addNotification,
  removeNotification,
  clearNotifications,
} from './uiSlice';
