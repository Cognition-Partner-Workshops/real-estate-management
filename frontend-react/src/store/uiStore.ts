import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  theme: 'light' | 'dark';
  toasts: Toast[];
  activeModal: string | null;
  sideMenuOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setSideMenuOpen: (open: boolean) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      toasts: [],
      activeModal: null,
      sideMenuOpen: false,

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      addToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            {
              ...toast,
              id: generateId(),
              duration: toast.duration ?? 5000,
            },
          ],
        })),

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      clearToasts: () => set({ toasts: [] }),

      openModal: (modalId) => set({ activeModal: modalId }),

      closeModal: () => set({ activeModal: null }),

      setSideMenuOpen: (open) => set({ sideMenuOpen: open }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);
