import { create } from 'zustand';
import type { UserProfile } from './types';
import { isDemoMode } from './demo';

interface MenuMateStore {
  profile: UserProfile;
  toastMessage: string | null;
  setAllergens: (allergens: string[]) => void;
  setDietaryRestrictions: (restrictions: string[]) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useStore = create<MenuMateStore>((set) => ({
  profile: {
    allergens: [],
    dietaryRestrictions: [],
  },
  toastMessage: null,

  setAllergens: (allergens) => {
    set((state) => ({
      profile: { ...state.profile, allergens },
      toastMessage: isDemoMode ? 'Demo mode — not saved' : null,
    }));
  },

  setDietaryRestrictions: (dietaryRestrictions) => {
    set((state) => ({
      profile: { ...state.profile, dietaryRestrictions },
      toastMessage: isDemoMode ? 'Demo mode — not saved' : null,
    }));
  },

  showToast: (message) => set({ toastMessage: message }),

  clearToast: () => set({ toastMessage: null }),
}));
