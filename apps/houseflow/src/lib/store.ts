import { create } from 'zustand';
import type {
  AuthUser,
  Household,
  HouseholdMember,
  Income,
  Expense,
  Goal,
  GoalContribution,
} from './types';
import { isDemoMode } from './demo';
import {
  DEMO_USER,
  DEMO_HOUSEHOLD,
  DEMO_MEMBERS,
  DEMO_INCOMES,
  DEMO_EXPENSES,
  DEMO_GOALS,
  DEMO_GOAL_CONTRIBUTIONS,
} from './mockData';

type Toast = {
  id: string;
  text: string;
};

type AppState = {
  user: AuthUser | null;
  household: Household | null;
  members: HouseholdMember[];
  incomes: Income[];
  expenses: Expense[];
  goals: Goal[];
  goalContributions: GoalContribution[];
  isPremium: boolean;
  showPaywall: boolean;
  toasts: Toast[];

  setUser: (user: AuthUser | null) => void;
  setHousehold: (h: Household | null) => void;
  setMembers: (m: HouseholdMember[]) => void;
  setIncomes: (i: Income[]) => void;
  setExpenses: (e: Expense[]) => void;
  setGoals: (g: Goal[]) => void;
  setGoalContributions: (c: GoalContribution[]) => void;
  setIsPremium: (v: boolean) => void;
  setShowPaywall: (v: boolean) => void;
  addToast: (text: string) => void;
  removeToast: (id: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  household: isDemoMode ? DEMO_HOUSEHOLD : null,
  members: isDemoMode ? DEMO_MEMBERS : [],
  incomes: isDemoMode ? DEMO_INCOMES : [],
  expenses: isDemoMode ? DEMO_EXPENSES : [],
  goals: isDemoMode ? DEMO_GOALS : [],
  goalContributions: isDemoMode ? DEMO_GOAL_CONTRIBUTIONS : [],
  isPremium: false,
  showPaywall: false,
  toasts: [],

  setUser: (user) => set({ user }),
  setHousehold: (household) => set({ household }),
  setMembers: (members) => set({ members }),
  setIncomes: (incomes) => set({ incomes }),
  setExpenses: (expenses) => set({ expenses }),
  setGoals: (goals) => set({ goals }),
  setGoalContributions: (goalContributions) => set({ goalContributions }),
  setIsPremium: (isPremium) => set({ isPremium }),
  setShowPaywall: (showPaywall) => set({ showPaywall }),
  addToast: (text) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Math.random().toString(36).slice(2), text }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
