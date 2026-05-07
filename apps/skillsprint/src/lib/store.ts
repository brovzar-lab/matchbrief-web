import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDemoMode } from './config';
import type { TrackId } from './config';

interface SkillSprintStore {
  uid: string | null;
  isAuthLoading: boolean;
  hasOnboarded: boolean;
  selectedTrack: TrackId | null;
  isPremium: boolean;
  streak: number;
  xp: number;
  toastMessage: string | null;

  setUid: (uid: string | null) => void;
  setIsAuthLoading: (v: boolean) => void;
  setHasOnboarded: (v: boolean) => void;
  setTrack: (track: TrackId) => void;
  completeOnboarding: () => void;
  setIsPremium: (v: boolean) => void;
  setStreak: (n: number) => void;
  setXp: (n: number) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useStore = create<SkillSprintStore>()(
  persist(
    (set) => ({
      uid: null,
      isAuthLoading: !isDemoMode,
      hasOnboarded: false,
      selectedTrack: null,
      isPremium: false,
      streak: isDemoMode ? 7 : 0,
      xp: isDemoMode ? 1240 : 0,
      toastMessage: null,

      setUid: (uid) => set({ uid }),
      setIsAuthLoading: (v) => set({ isAuthLoading: v }),
      setHasOnboarded: (v) => set({ hasOnboarded: v }),
      setTrack: (track) => set({ selectedTrack: track }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      setIsPremium: (v) => set({ isPremium: v }),
      setStreak: (n) => set({ streak: n }),
      setXp: (n) => set({ xp: n }),
      showToast: (message) => set({ toastMessage: message }),
      clearToast: () => set({ toastMessage: null }),
    }),
    {
      name: 'skillsprint-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        selectedTrack: state.selectedTrack,
        streak: state.streak,
        xp: state.xp,
      }),
    },
  ),
);
