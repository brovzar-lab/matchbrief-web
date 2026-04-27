import { create } from 'zustand';
import type { Category, BudgetConfig, Transaction } from './types';
import { isDemoMode, DEMO_BUDGET, DEMO_CATEGORIES, DEMO_TRANSACTIONS } from './demo';
import { colors } from './colors';

interface BudgetStore {
  isOnboarded: boolean;
  budget: BudgetConfig;
  categories: Category[];
  transactions: Transaction[];
  toastMessage: string | null;

  completeOnboarding: (budget: BudgetConfig, categories: Category[]) => void;
  enterDemo: () => void;
  resetOnboarding: () => void;

  addCategory: (name: string, emoji: string) => void;
  removeCategory: (id: string) => void;
  renameCategory: (id: string, name: string) => void;
  updateAllocation: (id: string, amount: number) => void;

  addTransaction: (categoryId: string, amount: number, description: string) => void;

  showToast: (message: string) => void;
  clearToast: () => void;
}

function totalAllocated(cats: Category[]): number {
  return cats.reduce((sum, c) => sum + c.allocated, 0);
}

export const useStore = create<BudgetStore>((set, get) => ({
  isOnboarded: false,
  budget: { name: 'My Budget', income: 0, monthYear: '' },
  categories: [],
  transactions: [],
  toastMessage: null,

  enterDemo: () => {
    set({
      isOnboarded: true,
      budget: DEMO_BUDGET,
      categories: DEMO_CATEGORIES,
      transactions: DEMO_TRANSACTIONS,
    });
  },

  completeOnboarding: (budget, categories) => {
    set({ isOnboarded: true, budget, categories, transactions: [] });
  },

  resetOnboarding: () => {
    set({ isOnboarded: false, budget: { name: 'My Budget', income: 0, monthYear: '' }, categories: [], transactions: [] });
  },

  addCategory: (name, emoji) => {
    const { categories } = get();
    const colorIndex = categories.length % colors.categoryColors.length;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      emoji,
      allocated: 0,
      spent: 0,
      color: colors.categoryColors[colorIndex],
    };
    set((s) => ({ categories: [...s.categories, newCat] }));
  },

  removeCategory: (id) => {
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
      transactions: s.transactions.filter((t) => t.categoryId !== id),
    }));
  },

  renameCategory: (id, name) => {
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, name } : c)),
    }));
  },

  updateAllocation: (id, amount) => {
    const { budget, categories } = get();
    const others = categories.filter((c) => c.id !== id);
    const otherTotal = totalAllocated(others);
    const clamped = Math.max(0, Math.min(amount, budget.income - otherTotal));
    if (isDemoMode) {
      get().showToast('Demo mode — changes not saved');
    }
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, allocated: clamped } : c)),
    }));
  },

  addTransaction: (categoryId, amount, description) => {
    if (isDemoMode) {
      get().showToast('Demo mode — not saved');
      return;
    }
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      categoryId,
      amount,
      description,
      date: new Date().toISOString().split('T')[0],
    };
    set((s) => ({
      transactions: [tx, ...s.transactions],
      categories: s.categories.map((c) =>
        c.id === categoryId ? { ...c, spent: c.spent + amount } : c,
      ),
    }));
  },

  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),
}));

export function useUnallocated(): number {
  const { budget, categories } = useStore();
  return budget.income - totalAllocated(categories);
}
