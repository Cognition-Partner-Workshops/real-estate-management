import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Enquiry } from '@/types';

interface EnquiriesState {
  enquiries: Enquiry[];
  selectedEnquiry: Enquiry | null;
  isLoading: boolean;
  initialFetchDone: boolean;
}

const initialState: EnquiriesState = {
  enquiries: [],
  selectedEnquiry: null,
  isLoading: false,
  initialFetchDone: false,
};

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
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetState: (state) => {
      state.enquiries = [];
      state.selectedEnquiry = null;
      state.initialFetchDone = false;
    },
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
  resetState,
} = enquiriesSlice.actions;

export default enquiriesSlice.reducer;
