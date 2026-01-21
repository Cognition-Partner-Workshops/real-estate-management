import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Enquiry, CreateEnquiryPayload, ApiError } from '@/types';
import * as enquiriesApi from '@/api/enquiries';

interface EnquiriesState {
  enquiries: Enquiry[];
  selectedEnquiry: Enquiry | null;
  isLoading: boolean;
  initialFetchDone: boolean;
  error: string | null;
}

const initialState: EnquiriesState = {
  enquiries: [],
  selectedEnquiry: null,
  isLoading: false,
  initialFetchDone: false,
  error: null,
};

export const fetchEnquiries = createAsyncThunk<
  Enquiry[],
  void,
  { rejectValue: string }
>('enquiries/fetchEnquiries', async (_, { rejectWithValue }) => {
  try {
    const response = await enquiriesApi.fetchEnquiries();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Failed to fetch enquiries');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to fetch enquiries');
  }
});

export const fetchEnquiry = createAsyncThunk<
  Enquiry,
  string,
  { rejectValue: string }
>('enquiries/fetchEnquiry', async (enquiryId, { rejectWithValue }) => {
  try {
    const response = await enquiriesApi.fetchEnquiry(enquiryId);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Failed to fetch enquiry');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to fetch enquiry');
  }
});

export const createEnquiry = createAsyncThunk<
  Enquiry,
  CreateEnquiryPayload,
  { rejectValue: string }
>('enquiries/createEnquiry', async (payload, { rejectWithValue }) => {
  try {
    const response = await enquiriesApi.createEnquiry(payload);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Failed to create enquiry');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to create enquiry');
  }
});

export const deleteEnquiry = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('enquiries/deleteEnquiry', async (enquiryId, { rejectWithValue }) => {
  try {
    const response = await enquiriesApi.deleteEnquiry(enquiryId);
    if (response.success) {
      return enquiryId;
    }
    return rejectWithValue(response.error || response.message || 'Failed to delete enquiry');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to delete enquiry');
  }
});

export const readEnquiry = createAsyncThunk<
  Enquiry,
  string,
  { rejectValue: string }
>('enquiries/readEnquiry', async (enquiryId, { rejectWithValue }) => {
  try {
    const response = await enquiriesApi.markEnquiryAsRead(enquiryId);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Failed to mark enquiry as read');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to mark enquiry as read');
  }
});

const enquiriesSlice = createSlice({
  name: 'enquiries',
  initialState,
  reducers: {
    setEnquiries: (state, action: PayloadAction<Enquiry[]>) => {
      state.enquiries = action.payload;
      state.initialFetchDone = true;
    },
    setSelectedEnquiry: (state, action: PayloadAction<Enquiry | null>) => {
      state.selectedEnquiry = action.payload;
    },
    addEnquiry: (state, action: PayloadAction<Enquiry>) => {
      state.enquiries = [action.payload, ...state.enquiries];
    },
    updateEnquiry: (state, action: PayloadAction<Enquiry>) => {
      const index = state.enquiries.findIndex(
        (e) => e.enquiry_id === action.payload.enquiry_id
      );
      if (index !== -1) {
        state.enquiries[index] = action.payload;
      }
      if (state.selectedEnquiry?.enquiry_id === action.payload.enquiry_id) {
        state.selectedEnquiry = action.payload;
      }
    },
    removeEnquiry: (state, action: PayloadAction<string>) => {
      state.enquiries = state.enquiries.filter(
        (e) => e.enquiry_id !== action.payload
      );
      if (state.selectedEnquiry?.enquiry_id === action.payload) {
        state.selectedEnquiry = null;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const enquiry = state.enquiries.find(
        (e) => e.enquiry_id === action.payload
      );
      if (enquiry) {
        enquiry.read = true;
      }
      if (state.selectedEnquiry?.enquiry_id === action.payload) {
        state.selectedEnquiry = { ...state.selectedEnquiry, read: true };
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
    resetState: (state) => {
      state.enquiries = [];
      state.selectedEnquiry = null;
      state.initialFetchDone = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enquiries = action.payload;
        state.initialFetchDone = true;
        state.error = null;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch enquiries';
      })
      .addCase(fetchEnquiry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnquiry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEnquiry = action.payload;
        state.error = null;
      })
      .addCase(fetchEnquiry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch enquiry';
      })
      .addCase(createEnquiry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEnquiry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enquiries = [action.payload, ...state.enquiries];
        state.error = null;
      })
      .addCase(createEnquiry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create enquiry';
      })
      .addCase(deleteEnquiry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEnquiry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enquiries = state.enquiries.filter(
          (e) => e.enquiry_id !== action.payload
        );
        if (state.selectedEnquiry?.enquiry_id === action.payload) {
          state.selectedEnquiry = null;
        }
        state.error = null;
      })
      .addCase(deleteEnquiry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete enquiry';
      })
      .addCase(readEnquiry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(readEnquiry.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.enquiries.findIndex(
          (e) => e.enquiry_id === action.payload.enquiry_id
        );
        if (index !== -1) {
          state.enquiries[index] = action.payload;
        }
        if (state.selectedEnquiry?.enquiry_id === action.payload.enquiry_id) {
          state.selectedEnquiry = action.payload;
        }
        state.error = null;
      })
      .addCase(readEnquiry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to mark enquiry as read';
      });
  },
});

export const {
  setEnquiries,
  setSelectedEnquiry,
  addEnquiry,
  updateEnquiry,
  removeEnquiry,
  markAsRead,
  setLoading,
  setError,
  clearError,
  resetState,
} = enquiriesSlice.actions;

interface EnquiriesRootState {
  enquiries: EnquiriesState;
}

export const selectEnquiries = (state: EnquiriesRootState): Enquiry[] =>
  state.enquiries.enquiries;

export const selectSelectedEnquiry = (state: EnquiriesRootState): Enquiry | null =>
  state.enquiries.selectedEnquiry;

export const selectEnquiriesLoading = (state: EnquiriesRootState): boolean =>
  state.enquiries.isLoading;

export const selectEnquiriesError = (state: EnquiriesRootState): string | null =>
  state.enquiries.error;

export const selectInitialFetchDone = (state: EnquiriesRootState): boolean =>
  state.enquiries.initialFetchDone;

export const selectUnreadEnquiriesCount = (
  state: EnquiriesRootState,
  currentUserId: string | undefined
): number => {
  if (!currentUserId) {
    return 0;
  }
  return state.enquiries.enquiries.filter(
    (e) => !e.read && e.users.to.user_id === currentUserId
  ).length;
};

export default enquiriesSlice.reducer;
