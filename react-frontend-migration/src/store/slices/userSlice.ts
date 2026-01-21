import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  User,
  UserSignedIn,
  LoginCredentials,
  RegisterPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
  ApiError,
} from '@/types';
import * as authApi from '@/api/auth';
import type { Property } from '@/types';

const STORAGE_KEY = 'rem_user';

interface UserState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function loadUserFromStorage(): { user: User | null; accessToken: string | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UserSignedIn;
      return { user: parsed.user, accessToken: parsed.accessToken };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return { user: null, accessToken: null };
}

function saveUserToStorage(data: UserSignedIn): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearUserFromStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

const storedUser = loadUserFromStorage();

const initialState: UserState = {
  user: storedUser.user,
  accessToken: storedUser.accessToken,
  isAuthenticated: storedUser.user !== null,
  isLoading: false,
  error: null,
};

export const signIn = createAsyncThunk<
  UserSignedIn,
  LoginCredentials,
  { rejectValue: string }
>('user/signIn', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authApi.signIn(credentials);
    if (response.success && response.data) {
      saveUserToStorage(response.data);
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Sign in failed');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Sign in failed');
  }
});

export const register = createAsyncThunk<
  UserSignedIn,
  RegisterPayload,
  { rejectValue: string }
>('user/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.register(payload);
    if (response.success && response.data) {
      saveUserToStorage(response.data);
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Registration failed');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Registration failed');
  }
});

export const googleAuth = createAsyncThunk<
  UserSignedIn,
  string,
  { rejectValue: string }
>('user/googleAuth', async (token, { rejectWithValue }) => {
  try {
    const response = await authApi.googleAuth(token);
    if (response.success && response.data) {
      saveUserToStorage(response.data);
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Google authentication failed');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Google authentication failed');
  }
});

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('user/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getCurrentUser();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Failed to get user');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to get user');
  }
});

export const updateUser = createAsyncThunk<
  User,
  UpdateUserPayload,
  { rejectValue: string }
>('user/updateUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.updateUser(payload);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Failed to update user');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to update user');
  }
});

export const changePassword = createAsyncThunk<
  void,
  ChangePasswordPayload,
  { rejectValue: string }
>('user/changePassword', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.changePassword(payload);
    if (response.success) {
      return;
    }
    return rejectWithValue(response.error || response.message || 'Failed to change password');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to change password');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserSignedIn>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
      saveUserToStorage(action.payload);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (state.accessToken) {
        saveUserToStorage({ user: action.payload, accessToken: state.accessToken });
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      clearUserFromStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Sign in failed';
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      })
      .addCase(googleAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Google authentication failed';
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to get user';
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
        if (state.accessToken) {
          saveUserToStorage({ user: action.payload, accessToken: state.accessToken });
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update user';
      })
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to change password';
      });
  },
});

export const {
  setCredentials,
  setUser,
  setLoading,
  setError,
  clearError,
  logout,
} = userSlice.actions;

export const selectUser = (state: { user: UserState }): User | null => state.user.user;
export const selectAccessToken = (state: { user: UserState }): string | null => state.user.accessToken;
export const selectIsAuthenticated = (state: { user: UserState }): boolean => state.user.isAuthenticated;
export const selectIsLoading = (state: { user: UserState }): boolean => state.user.isLoading;
export const selectError = (state: { user: UserState }): string | null => state.user.error;

export const selectIsPropertyOwner = (
  state: { user: UserState },
  property: Property | null
): boolean => {
  const user = state.user.user;
  if (!user || !property) {
    return false;
  }
  return user.user_id === property.user_id;
};

export default userSlice.reducer;
