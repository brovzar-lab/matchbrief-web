import { create } from 'zustand';
import type { AppUser, Legacy, Recipient } from './types';
import { DEMO_USER, DEMO_LEGACIES, DEMO_RECIPIENTS } from './mockData';
import { isDemoMode } from './config';

interface AppState {
  // Auth
  user: AppUser | null;
  isAuthLoading: boolean;
  // Legacies
  legacies: Legacy[];
  isLegaciesLoading: boolean;
  // Recipients (global address book)
  recipients: Recipient[];
  // Actions
  setUser: (user: AppUser | null) => void;
  setAuthLoading: (v: boolean) => void;
  setLegacies: (legacies: Legacy[]) => void;
  addLegacy: (legacy: Legacy) => void;
  updateLegacy: (id: string, patch: Partial<Legacy>) => void;
  deleteLegacy: (id: string) => void;
  setRecipients: (recipients: Recipient[]) => void;
  addRecipient: (recipient: Recipient) => void;
  removeRecipient: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  isAuthLoading: !isDemoMode,
  legacies: isDemoMode ? DEMO_LEGACIES : [],
  isLegaciesLoading: false,
  recipients: isDemoMode ? DEMO_RECIPIENTS : [],

  setUser: (user) => set({ user }),
  setAuthLoading: (v) => set({ isAuthLoading: v }),
  setLegacies: (legacies) => set({ legacies }),
  addLegacy: (legacy) =>
    set((s) => ({ legacies: [legacy, ...s.legacies] })),
  updateLegacy: (id, patch) =>
    set((s) => ({
      legacies: s.legacies.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    })),
  deleteLegacy: (id) =>
    set((s) => ({ legacies: s.legacies.filter((l) => l.id !== id) })),
  setRecipients: (recipients) => set({ recipients }),
  addRecipient: (recipient) =>
    set((s) => ({ recipients: [...s.recipients, recipient] })),
  removeRecipient: (id) =>
    set((s) => ({ recipients: s.recipients.filter((r) => r.id !== id) })),
}));
