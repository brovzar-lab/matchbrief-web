import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { useGoalProgress } from '../lib/hooks';
import { isDemoMode } from '../lib/demo';
import Nav from '../components/Nav';
import type { Goal } from '../lib/types';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

type GoalCardProps = {
  goal: Goal;
};

function GoalCard({ goal }: GoalCardProps): JSX.Element {
  const saved = useGoalProgress(goal.id);
  const pct = Math.min(100, Math.round((saved / goal.targetAmount) * 100));
  const addToast = useAppStore((s) => s.addToast);
  const goalContributions = useAppStore((s) => s.goalContributions);
  const setGoalContributions = useAppStore((s) => s.setGoalContributions);
  const user = useAppStore((s) => s.user);
  const [showContrib, setShowContrib] = useState(false);
  const [amount, setAmount] = useState('');

  function handleContribute(): void {
    if (!amount || !user) return;
    if (isDemoMode) {
      addToast('Demo mode — contribution not saved');
      setShowContrib(false);
      setAmount('');
      return;
    }
    setGoalContributions([
      ...goalContributions,
      {
        id: Math.random().toString(36).slice(2),
        goalId: goal.id,
        userId: user.uid,
        amount: parseFloat(amount),
        date: new Date(),
      },
    ]);
    setShowContrib(false);
    setAmount('');
    addToast('Contribution logged!');
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
          {goal.targetDate && (
            <p className="text-xs text-gray-400 mt-0.5">
              Target: {goal.targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
            goal.status === 'active'
              ? 'bg-brand-50 text-brand-600'
              : goal.status === 'completed'
              ? 'bg-green-50 text-green-600'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {goal.status}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{fmt(saved)} saved</span>
          <span>{fmt(goal.targetAmount)} goal</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-brand-500 h-2.5 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-brand-600 font-semibold mt-1">{pct}% complete</p>
      </div>

      {goal.status === 'active' && (
        <>
          {showContrib ? (
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount ($)"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={handleContribute}
                className="bg-brand-500 text-white rounded-xl px-3 py-2 text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                Log
              </button>
              <button
                onClick={() => { setShowContrib(false); setAmount(''); }}
                className="text-gray-400 text-sm px-2"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowContrib(true)}
              className="mt-3 w-full border border-brand-200 text-brand-600 rounded-xl py-2 text-sm font-medium hover:bg-brand-50 transition-colors"
            >
              + Log Contribution
            </button>
          )}
        </>
      )}
    </div>
  );
}

type AddGoalFormState = {
  title: string;
  targetAmount: string;
  targetDate: string;
};

const DEFAULT_GOAL_FORM: AddGoalFormState = {
  title: '',
  targetAmount: '',
  targetDate: '',
};

export default function GoalTrackerScreen(): JSX.Element {
  const goals = useAppStore((s) => s.goals);
  const setGoals = useAppStore((s) => s.setGoals);
  const addToast = useAppStore((s) => s.addToast);
  const isPremium = useAppStore((s) => s.isPremium);
  const setShowPaywall = useAppStore((s) => s.setShowPaywall);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddGoalFormState>(DEFAULT_GOAL_FORM);

  function handleAddGoal(): void {
    if (!form.title.trim() || !form.targetAmount) return;
    if (isDemoMode) {
      addToast('Demo mode — goal not saved');
      setShowForm(false);
      setForm(DEFAULT_GOAL_FORM);
      return;
    }
    const newGoal: Goal = {
      id: Math.random().toString(36).slice(2),
      title: form.title.trim(),
      targetAmount: parseFloat(form.targetAmount),
      targetDate: form.targetDate ? new Date(form.targetDate) : null,
      status: 'active',
    };
    setGoals([...goals, newGoal]);
    setShowForm(false);
    setForm(DEFAULT_GOAL_FORM);
    addToast('Goal created!');
  }

  function handleAddClick(): void {
    if (!isPremium && !isDemoMode) {
      setShowPaywall(true);
      return;
    }
    setShowForm(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Goals</h1>
        <button
          onClick={handleAddClick}
          className="bg-brand-500 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          + Add Goal
        </button>
      </header>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {goals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-12 flex flex-col items-center gap-3">
            <span className="text-4xl">🎯</span>
            <p className="text-gray-400 text-sm">No goals yet. Set your first one!</p>
          </div>
        ) : (
          goals.map((g) => <GoalCard key={g.id} goal={g} />)
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">New Goal</h2>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Goal title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Emergency Fund"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Target amount ($)</label>
              <input
                type="number"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                placeholder="10000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Target date (optional)</label>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowForm(false); setForm(DEFAULT_GOAL_FORM); }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                className="flex-1 bg-brand-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      <Nav />
    </div>
  );
}
