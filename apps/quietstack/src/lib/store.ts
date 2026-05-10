import { create } from 'zustand';
import type { AuthUser, Synthesis, RateLimitInfo } from './types';
import { isDemoMode } from './demo';
import { DEMO_SYNTHESES, DEMO_RATE_LIMIT } from './mockData';

type Toast = {
  id: string;
  text: string;
};

type AppState = {
  user: AuthUser | null;
  syntheses: Synthesis[];
  rateLimitInfo: RateLimitInfo | null;
  toasts: Toast[];
  showPaywall: boolean;
  setUser: (user: AuthUser | null) => void;
  setSyntheses: (syntheses: Synthesis[]) => void;
  prependSynthesis: (synthesis: Synthesis) => void;
  setRateLimitInfo: (info: RateLimitInfo) => void;
  setShowPaywall: (show: boolean) => void;
  addToast: (text: string) => void;
  removeToast: (id: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  user: isDemoMode ? { uid: 'demo-user', email: null, displayName: 'Demo User', isDemo: true } : null,
  syntheses: isDemoMode ? DEMO_SYNTHESES : [],
  rateLimitInfo: isDemoMode ? DEMO_RATE_LIMIT : null,
  toasts: [],
  showPaywall: false,
  setUser: (user) => set({ user }),
  setSyntheses: (syntheses) => set({ syntheses }),
  prependSynthesis: (synthesis) =>
    set((state) => ({ syntheses: [synthesis, ...state.syntheses] })),
  setRateLimitInfo: (info) => set({ rateLimitInfo: info }),
  setShowPaywall: (show) => set({ showPaywall: show }),
  addToast: (text) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Math.random().toString(36).slice(2), text }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
