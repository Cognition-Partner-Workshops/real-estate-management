import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Activity } from '@/types';
import type { ApiResponse } from '@/types';
import type { RootState } from '../store';

interface ActivitiesState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ActivitiesState = {
  activities: [],
  isLoading: false,
  error: null,
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

export const fetchActivities = createAsyncThunk<
  Activity[],
  void,
  { state: RootState; rejectValue: string }
>('activities/fetchActivities', async (_, { getState, rejectWithValue }) => {
    const { user } = getState();
    const token = user.accessToken;

  if (!token) {
    return rejectWithValue('No authentication token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}activities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.message || 'Failed to fetch activities');
    }

    const data: ApiResponse<Activity[]> = await response.json();
    return data.data || [];
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('An unexpected error occurred');
  }
});

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setActivities: (state, action: PayloadAction<Activity[]>) => {
      state.activities = action.payload;
    },
    insertActivity: (state, action: PayloadAction<Activity>) => {
      state.activities = [action.payload, ...state.activities];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetState: (state) => {
      state.activities = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch activities';
      });
  },
});

export const {
  setActivities,
  insertActivity,
  setLoading,
  setError,
  resetState,
} = activitiesSlice.actions;

export const selectActivities = (state: RootState): Activity[] =>
  state.activities.activities;
export const selectActivitiesLoading = (state: RootState): boolean =>
  state.activities.isLoading;
export const selectActivitiesError = (state: RootState): string | null =>
  state.activities.error;

export default activitiesSlice.reducer;
