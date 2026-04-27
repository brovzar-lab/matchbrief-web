import type { Category, BudgetConfig, Transaction } from './types';
import { colors } from './colors';

export const isDemoMode =
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

export const DEMO_BUDGET: BudgetConfig = {
  name: "April Budget",
  income: 5000,
  monthYear: "April 2026",
};

export const DEMO_CATEGORIES: Category[] = [
  {
    id: 'cat-housing',
    name: 'Housing',
    emoji: '🏠',
    allocated: 1500,
    spent: 1500,
    color: colors.categoryColors[0],
  },
  {
    id: 'cat-food',
    name: 'Food',
    emoji: '🍔',
    allocated: 600,
    spent: 420,
    color: colors.categoryColors[1],
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    emoji: '🚗',
    allocated: 400,
    spent: 210,
    color: colors.categoryColors[2],
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    emoji: '🎬',
    allocated: 200,
    spent: 85,
    color: colors.categoryColors[3],
  },
  {
    id: 'cat-savings',
    name: 'Savings',
    emoji: '💰',
    allocated: 750,
    spent: 750,
    color: colors.categoryColors[4],
  },
  {
    id: 'cat-other',
    name: 'Other',
    emoji: '📦',
    allocated: 300,
    spent: 120,
    color: colors.categoryColors[5],
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', categoryId: 'cat-housing', amount: 1500, description: 'Rent', date: '2026-04-01' },
  { id: 'tx-2', categoryId: 'cat-food', amount: 85, description: 'Grocery run', date: '2026-04-03' },
  { id: 'tx-3', categoryId: 'cat-food', amount: 42, description: 'Dinner out', date: '2026-04-05' },
  { id: 'tx-4', categoryId: 'cat-transport', amount: 120, description: 'Gas', date: '2026-04-06' },
  { id: 'tx-5', categoryId: 'cat-savings', amount: 750, description: 'Monthly savings', date: '2026-04-07' },
  { id: 'tx-6', categoryId: 'cat-entertainment', amount: 15, description: 'Streaming', date: '2026-04-08' },
  { id: 'tx-7', categoryId: 'cat-food', amount: 293, description: 'Costco', date: '2026-04-10' },
  { id: 'tx-8', categoryId: 'cat-transport', amount: 90, description: 'Metro pass', date: '2026-04-11' },
  { id: 'tx-9', categoryId: 'cat-entertainment', amount: 70, description: 'Concert tickets', date: '2026-04-14' },
  { id: 'tx-10', categoryId: 'cat-other', amount: 120, description: 'Phone bill', date: '2026-04-15' },
];

export const PRESET_CATEGORIES = [
  { name: 'Housing', emoji: '🏠' },
  { name: 'Food', emoji: '🍔' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Savings', emoji: '💰' },
  { name: 'Other', emoji: '📦' },
  { name: 'Health', emoji: '🏥' },
  { name: 'Education', emoji: '📚' },
  { name: 'Clothing', emoji: '👕' },
  { name: 'Travel', emoji: '✈️' },
];
