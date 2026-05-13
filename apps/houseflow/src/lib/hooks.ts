import { useMemo } from 'react';
import { useAppStore } from './store';
import type { SplitSummary } from './types';

export function useSplitSummary(): SplitSummary | null {
  const members = useAppStore((s) => s.members);
  const incomes = useAppStore((s) => s.incomes);
  const expenses = useAppStore((s) => s.expenses);

  return useMemo(() => {
    if (members.length < 2) return null;

    const partnerA = members.find((m) => m.color === 'partner-a');
    const partnerB = members.find((m) => m.color === 'partner-b');
    if (!partnerA || !partnerB) return null;

    const toMonthly = (amount: number, frequency: 'monthly' | 'annual') =>
      frequency === 'annual' ? amount / 12 : amount;

    const partnerAMonthly = incomes
      .filter((i) => i.userId === partnerA.userId)
      .reduce((sum, i) => sum + toMonthly(i.amount, i.frequency), 0);

    const partnerBMonthly = incomes
      .filter((i) => i.userId === partnerB.userId)
      .reduce((sum, i) => sum + toMonthly(i.amount, i.frequency), 0);

    const householdMonthly = partnerAMonthly + partnerBMonthly;

    const partnerARatio = householdMonthly > 0 ? partnerAMonthly / householdMonthly : 0.5;
    const partnerBRatio = householdMonthly > 0 ? partnerBMonthly / householdMonthly : 0.5;

    const sharedExpenses = expenses.filter((e) => e.isShared);
    const sharedTotal = sharedExpenses.reduce((sum, e) => sum + e.amount, 0);

    const partnerAFairShare = sharedTotal * partnerARatio;
    const partnerBFairShare = sharedTotal * partnerBRatio;

    const partnerAPersonal = expenses
      .filter((e) => !e.isShared && e.addedBy === partnerA.userId)
      .reduce((sum, e) => sum + e.amount, 0);

    const partnerBPersonal = expenses
      .filter((e) => !e.isShared && e.addedBy === partnerB.userId)
      .reduce((sum, e) => sum + e.amount, 0);

    const partnerAOwes = partnerAFairShare + partnerAPersonal;
    const partnerBOwes = partnerBFairShare + partnerBPersonal;

    return {
      partnerA,
      partnerB,
      partnerAMonthly,
      partnerBMonthly,
      householdMonthly,
      partnerARatio,
      partnerBRatio,
      sharedTotal,
      partnerAFairShare,
      partnerBFairShare,
      partnerAPersonal,
      partnerBPersonal,
      partnerAOwes,
      partnerBOwes,
    };
  }, [members, incomes, expenses]);
}

export function useGoalProgress(goalId: string): number {
  const contributions = useAppStore((s) => s.goalContributions);
  return useMemo(() => {
    return contributions
      .filter((c) => c.goalId === goalId)
      .reduce((sum, c) => sum + c.amount, 0);
  }, [contributions, goalId]);
}
