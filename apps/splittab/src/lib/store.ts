import { create } from 'zustand';
import type { AuthUser, Session, Item, Participant } from './types';
import { isDemoMode } from './demo';
import { DEMO_SESSION, DEMO_ITEMS, DEMO_PARTICIPANTS } from './mockData';

type Toast = {
  id: string;
  text: string;
};

type AppState = {
  user: AuthUser | null;
  session: Session | null;
  items: Item[];
  participants: Participant[];
  toasts: Toast[];
  guestParticipantId: string | null;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: Session | null) => void;
  setItems: (items: Item[]) => void;
  setParticipants: (participants: Participant[]) => void;
  setGuestParticipantId: (id: string) => void;
  addToast: (text: string) => void;
  removeToast: (id: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  user: isDemoMode ? { uid: 'demo-host', isDemo: true } : null,
  session: isDemoMode ? DEMO_SESSION : null,
  items: isDemoMode ? DEMO_ITEMS : [],
  participants: isDemoMode ? DEMO_PARTICIPANTS : [],
  toasts: [],
  guestParticipantId: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setItems: (items) => set({ items }),
  setParticipants: (participants) => set({ participants }),
  setGuestParticipantId: (id) => set({ guestParticipantId: id }),
  addToast: (text) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Math.random().toString(36).slice(2), text }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
