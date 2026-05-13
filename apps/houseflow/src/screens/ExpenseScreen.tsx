import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import Nav from '../components/Nav';
import type { Expense, ExpenseCategory } from '../lib/types';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

const CATEGORIES: ExpenseCategory[] = [
  'housing', 'groceries', 'utilities', 'transport', 'dining',
  'health', 'entertainment', 'subscriptions', 'other',
];

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  housing: '🏠', groceries: '🛒', utilities: '💡', transport: '🚌',
  dining: '🍽️', health: '❤️', entertainment: '🎬', subscriptions: '📱', other: '📦',
};

type FormState = {
  label: string;
  amount: string;
  category: ExpenseCategory;
  isShared: boolean;
  splitRatio: string;
};

const DEFAULT_FORM: FormState = {
  label: '',
  amount: '',
  category: 'other',
  isShared: true,
  splitRatio: '50',
};

export default function ExpenseScreen(): JSX.Element {
  const expenses = useAppStore((s) => s.expenses);
  const members = useAppStore((s) => s.members);
  const user = useAppStore((s) => s.user);
  const setExpenses = useAppStore((s) => s.setExpenses);
  const addToast = useAppStore((s) => s.addToast);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  function getMemberName(userId: string): string {
    return members.find((m) => m.userId === userId)?.displayName ?? 'Unknown';
  }

  function handleAdd(): void {
    if (!form.label.trim() || !form.amount || !user) return;
    if (isDemoMode) {
      addToast('Demo mode — expense not saved');
      setShowForm(false);
      setForm(DEFAULT_FORM);
      return;
    }
    const newExpense: Expense = {
      id: Math.random().toString(36).slice(2),
      amount: parseFloat(form.amount),
      category: form.category,
      isShared: form.isShared,
      splitRatio: form.isShared ? parseFloat(form.splitRatio) / 100 : 1,
      addedBy: user.uid,
      date: new Date(),
      label: form.label.trim(),
    };
    setExpenses([...expenses, newExpense]);
    setShowForm(false);
    setForm(DEFAULT_FORM);
    addToast('Expense added');
  }

  const sharedTotal = expenses.filter((e) => e.isShared).reduce((s, e) => s + e.amount, 0);
  const personalTotal = expenses.filter((e) => !e.isShared).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-500 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          + Add
        </button>
      </header>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Summary chips */}
        <div className="flex gap-3">
          <div className="flex-1 bg-brand-50 rounded-2xl p-3 text-center">
            <p className="text-xs text-brand-600 font-medium">Shared</p>
            <p className="text-lg font-bold text-brand-700">{fmt(sharedTotal)}</p>
          </div>
          <div className="flex-1 bg-gray-100 rounded-2xl p-3 text-center">
            <p className="text-xs text-gray-500 font-medium">Personal</p>
            <p className="text-lg font-bold text-gray-700">{fmt(personalTotal)}</p>
          </div>
        </div>

        {/* Expense list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {expenses.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">No expenses yet.</p>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp.id}
                className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CATEGORY_ICONS[exp.category]}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{exp.label}</p>
                    <p className="text-xs text-gray-400">
                      {getMemberName(exp.addedBy)} ·{' '}
                      {exp.isShared ? `Shared (${Math.round(exp.splitRatio * 100)}%)` : 'Personal'}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">{fmt(exp.amount)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-gray-900 text-lg">Add Expense</h2>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Weekly groceries"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount ($)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      form.category === cat
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {CATEGORY_ICONS[cat]} {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Shared expense</p>
                <p className="text-xs text-gray-400">Split between both partners</p>
              </div>
              <button
                onClick={() => setForm({ ...form, isShared: !form.isShared })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  form.isShared ? 'bg-brand-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.isShared ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {form.isShared && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Partner A split ratio (%)
                </label>
                <input
                  type="number"
                  value={form.splitRatio}
                  onChange={(e) => setForm({ ...form, splitRatio: e.target.value })}
                  min="0"
                  max="100"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Partner B: {100 - parseInt(form.splitRatio || '0')}%
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowForm(false); setForm(DEFAULT_FORM); }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 bg-brand-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <Nav />
    </div>
  );
}
