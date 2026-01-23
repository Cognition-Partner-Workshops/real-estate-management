import { create } from 'zustand';
import type { Enquiry } from '@/types';

interface EnquiriesState {
  enquiries: Enquiry[];
  currentEnquiry: Enquiry | null;
  initialFetchDone: boolean;
  setEnquiries: (enquiries: Enquiry[]) => void;
  setCurrentEnquiry: (enquiry: Enquiry | null) => void;
  addEnquiry: (enquiry: Enquiry) => void;
  updateEnquiry: (enquiryId: string, updates: Partial<Enquiry>) => void;
  removeEnquiry: (enquiryId: string) => void;
  markAsRead: (enquiryId: string) => void;
  setInitialFetchDone: (done: boolean) => void;
  resetState: () => void;
}

export const useEnquiriesStore = create<EnquiriesState>((set) => ({
  enquiries: [],
  currentEnquiry: null,
  initialFetchDone: false,

  setEnquiries: (enquiries) => set({ enquiries }),

  setCurrentEnquiry: (enquiry) => set({ currentEnquiry: enquiry }),

  addEnquiry: (enquiry) =>
    set((state) => ({
      enquiries: [enquiry, ...state.enquiries],
    })),

  updateEnquiry: (enquiryId, updates) =>
    set((state) => ({
      enquiries: state.enquiries.map((e) =>
        e.enquiry_id === enquiryId ? { ...e, ...updates } : e
      ),
      currentEnquiry:
        state.currentEnquiry?.enquiry_id === enquiryId
          ? { ...state.currentEnquiry, ...updates }
          : state.currentEnquiry,
    })),

  removeEnquiry: (enquiryId) =>
    set((state) => ({
      enquiries: state.enquiries.filter((e) => e.enquiry_id !== enquiryId),
      currentEnquiry:
        state.currentEnquiry?.enquiry_id === enquiryId
          ? null
          : state.currentEnquiry,
    })),

  markAsRead: (enquiryId) =>
    set((state) => ({
      enquiries: state.enquiries.map((e) =>
        e.enquiry_id === enquiryId ? { ...e, read: true } : e
      ),
      currentEnquiry:
        state.currentEnquiry?.enquiry_id === enquiryId
          ? { ...state.currentEnquiry, read: true }
          : state.currentEnquiry,
    })),

  setInitialFetchDone: (done) => set({ initialFetchDone: done }),

  resetState: () =>
    set({
      enquiries: [],
      currentEnquiry: null,
      initialFetchDone: false,
    }),
}));
