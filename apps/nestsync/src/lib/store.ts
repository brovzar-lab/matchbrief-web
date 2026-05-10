import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import type { AppUser, Household, CalendarEvent, Message, Expense } from './types';
import {
  DEMO_USER,
  DEMO_HOUSEHOLD,
  DEMO_EVENTS,
  DEMO_MESSAGES,
  DEMO_EXPENSES,
} from './mockData';
import { isDemoMode } from './config';
import { auth, db } from './firebase';

interface AppState {
  user: AppUser | null;
  isAuthLoading: boolean;
  household: Household | null;
  events: CalendarEvent[];
  messages: Message[];
  expenses: Expense[];

  setUser: (user: AppUser | null) => void;
  setAuthLoading: (v: boolean) => void;
  setHousehold: (h: Household | null) => void;
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
}

export const useStore = create<AppState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  isAuthLoading: !isDemoMode,
  household: isDemoMode ? DEMO_HOUSEHOLD : null,
  events: isDemoMode ? DEMO_EVENTS : [],
  messages: isDemoMode ? DEMO_MESSAGES : [],
  expenses: isDemoMode ? DEMO_EXPENSES : [],

  setUser: (user) => set({ user }),
  setAuthLoading: (v) => set({ isAuthLoading: v }),
  setHousehold: (household) => set({ household }),
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((s) => ({ expenses: [expense, ...s.expenses] })),
  updateExpense: (id, patch) =>
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
}));

export function initAuthListener(): () => void {
  if (isDemoMode || !auth || !db) return () => {};

  return onAuthStateChanged(auth, async (firebaseUser) => {
    const { setUser, setAuthLoading } = useStore.getState();

    if (firebaseUser) {
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
    } else {
      setUser(null);
    }

    setAuthLoading(false);
  });
}

export function initHouseholdListener(householdId: string): () => void {
  if (isDemoMode || !db) return () => {};
  const ref = doc(db, 'households', householdId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    useStore.getState().setHousehold({
      id: snap.id,
      parent1Uid: data.parent1Uid,
      parent2Uid: data.parent2Uid ?? null,
      subscriptionActive: data.subscriptionActive ?? false,
      revenueCatCustomerId: data.revenueCatCustomerId ?? null,
      inviteCode: data.inviteCode,
      createdAt: data.createdAt?.toDate() ?? new Date(),
    });
  });
}
