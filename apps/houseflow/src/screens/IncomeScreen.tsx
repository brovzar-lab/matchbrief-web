import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import Nav from '../components/Nav';
import type { Income, IncomeFrequency, IncomeType } from '../lib/types';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function toMonthly(amount: number, freq: IncomeFrequency): number {
  return freq === 'annual' ? amount / 12 : amount;
}

type FormState = {
  source: string;
  amount: string;
  frequency: IncomeFrequency;
  type: IncomeType;
};

const DEFAULT_FORM: FormState = {
  source: '',
  amount: '',
  frequency: 'annual',
  type: 'salary',
};

export default function IncomeScreen(): JSX.Element {
  const incomes = useAppStore((s) => s.incomes);
  const members = useAppStore((s) => s.members);
  const user = useAppStore((s) => s.user);
  const setIncomes = useAppStore((s) => s.setIncomes);
  const addToast = useAppStore((s) => s.addToast);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const partnerA = members.find((m) => m.color === 'partner-a');
  const partnerB = members.find((m) => m.color === 'partner-b');

  function getMemberName(userId: string): string {
    return members.find((m) => m.userId === userId)?.displayName ?? userId;
  }

  function handleAdd(): void {
    if (!form.source.trim() || !form.amount || !user) return;
    if (isDemoMode) {
      addToast('Demo mode — income not saved');
      setShowForm(false);
      setForm(DEFAULT_FORM);
      return;
    }
    const newIncome: Income = {
      id: Math.random().toString(36).slice(2),
      userId: user.uid,
      source: form.source.trim(),
      amount: parseFloat(form.amount),
      frequency: form.frequency,
      type: form.type,
    };
    setIncomes([...incomes, newIncome]);
    setShowForm(false);
    setForm(DEFAULT_FORM);
    addToast('Income source added');
  }

  const groups = [partnerA, partnerB].filter(Boolean) as typeof members;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Income</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-500 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          + Add
        </button>
      </header>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {groups.map((member) => {
          const memberIncomes = incomes.filter((i) => i.userId === member.userId);
          const total = memberIncomes.reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0);
          return (
            <div key={member.userId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${member.color === 'partner-a' ? 'bg-brand-500' : 'bg-slate-400'}`}
                  />
                  <h2 className="font-semibold text-gray-900 text-sm">{member.displayName}</h2>
                  <span className="text-xs text-gray-400 capitalize">{member.employmentType}</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{fmt(total)}/mo</p>
              </div>

              {memberIncomes.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-400">No income sources yet.</p>
              ) : (
                memberIncomes.map((inc) => (
                  <div
                    key={inc.id}
                    className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{inc.source}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {inc.type} · {inc.frequency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{fmt(inc.amount)}</p>
                      <p className="text-xs text-gray-400">{fmt(toMonthly(inc.amount, inc.frequency))}/mo</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Add Income Source</h2>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">For</label>
              <p className="text-sm text-gray-700">{getMemberName(user?.uid ?? '')}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Source / employer</label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="e.g. Acme Corp"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="95000"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value as IncomeFrequency })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <div className="flex gap-2 flex-wrap">
                {(['salary', 'freelance', 'rental', 'other'] as IncomeType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, type: t })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      form.type === t
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

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
