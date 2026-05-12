import { create } from 'zustand';
import type { AuthUser, Group, Session, UserProfile, LineItem } from './types';
import { isDemoMode } from './demo';
import { DEMO_GROUPS, DEMO_SESSION, DEMO_USER_PROFILE, DEMO_HISTORY } from './mockData';

type Toast = {
  id: string;
  text: string;
};

type AppState = {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  groups: Group[];
  activeSessions: Session[];
  pastSessions: Session[];
  isPro: boolean;
  showPaywall: boolean;
  toasts: Toast[];
  pendingItems: LineItem[];
  setUser: (user: AuthUser | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setGroups: (groups: Group[]) => void;
  setActiveSessions: (sessions: Session[]) => void;
  setPastSessions: (sessions: Session[]) => void;
  setIsPro: (isPro: boolean) => void;
  setShowPaywall: (show: boolean) => void;
  setPendingItems: (items: LineItem[]) => void;
  addToast: (text: string) => void;
  removeToast: (id: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  user: isDemoMode
    ? { uid: 'demo-uid', email: 'demo@splitsnap.app', displayName: 'You', isDemo: true }
    : null,
  userProfile: isDemoMode ? DEMO_USER_PROFILE : null,
  groups: isDemoMode ? DEMO_GROUPS : [],
  activeSessions: isDemoMode ? [DEMO_SESSION] : [],
  pastSessions: isDemoMode ? DEMO_HISTORY : [],
  isPro: false,
  showPaywall: false,
  toasts: [],
  pendingItems: [],
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setGroups: (groups) => set({ groups }),
  setActiveSessions: (sessions) => set({ activeSessions: sessions }),
  setPastSessions: (sessions) => set({ pastSessions: sessions }),
  setIsPro: (isPro) => set({ isPro }),
  setShowPaywall: (show) => set({ showPaywall: show }),
  setPendingItems: (items) => set({ pendingItems: items }),
  addToast: (text) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Math.random().toString(36).slice(2), text }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
