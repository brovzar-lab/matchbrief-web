import { create } from 'zustand';
import { isDemoMode } from './demo';

interface DriftStore {
  dailyCaptureCount: number;
  toastMessage: string | null;
  incrementCapture: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useStore = create<DriftStore>((set) => ({
  dailyCaptureCount: isDemoMode ? 3 : 0,
  toastMessage: null,

  incrementCapture: () => {
    if (isDemoMode) {
      set({ toastMessage: 'Demo mode — not saved' });
      return;
    }
    set((state) => ({ dailyCaptureCount: state.dailyCaptureCount + 1 }));
  },

  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),
}));
