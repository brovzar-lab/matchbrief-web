import { useAppStore } from '../lib/store';
import { useSplitSummary } from '../lib/hooks';
import Nav from '../components/Nav';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function DashboardScreen(): JSX.Element {
  const household = useAppStore((s) => s.household);
  const expenses = useAppStore((s) => s.expenses);
  const split = useSplitSummary();

  const sharedExpenses = expenses.filter((e) => e.isShared);
  const totalShared = sharedExpenses.reduce((s, e) => s + e.amount, 0);

  const partnerAPersonalExpenses = split
    ? expenses.filter((e) => !e.isShared && e.addedBy === split.partnerA.userId)
    : [];
  const partnerBPersonalExpenses = split
    ? expenses.filter((e) => !e.isShared && e.addedBy === split.partnerB.userId)
    : [];

  const partnerAPersonalTotal = partnerAPersonalExpenses.reduce((s, e) => s + e.amount, 0);
  const partnerBPersonalTotal = partnerBPersonalExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-brand-500 text-white px-4 pt-10 pb-6">
        <p className="text-brand-200 text-sm font-medium">Household</p>
        <h1 className="text-2xl font-bold mt-0.5">{household?.name ?? 'My Household'}</h1>
        <p className="text-brand-200 text-xs mt-1">May 2026</p>
      </header>

      <div className="px-4 -mt-4 space-y-4 max-w-2xl mx-auto">
        {/* Partner Income Cards */}
        {split && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                <p className="text-xs font-medium text-gray-500">{split.partnerA.displayName}</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(split.partnerAMonthly)}</p>
              <p className="text-xs text-gray-400 mt-0.5">/ month</p>
              <p className="text-xs text-brand-600 font-medium mt-2 bg-brand-50 rounded-lg px-2 py-1 inline-block">
                {Math.round(split.partnerARatio * 100)}% of household
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <p className="text-xs font-medium text-gray-500">{split.partnerB.displayName}</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(split.partnerBMonthly)}</p>
              <p className="text-xs text-gray-400 mt-0.5">/ month</p>
              <p className="text-xs text-slate-600 font-medium mt-2 bg-slate-50 rounded-lg px-2 py-1 inline-block">
                {Math.round(split.partnerBRatio * 100)}% of household
              </p>
            </div>
          </div>
        )}

        {/* This Month Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">This Month</h2>
          </div>

          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Shared expenses</p>
              <p className="font-semibold text-gray-900">{fmt(totalShared)}</p>
            </div>
            <div className="mt-2 space-y-1.5">
              {sharedExpenses.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-xs text-gray-500">
                  <span>{e.label}</span>
                  <span>{fmt(e.amount)}</span>
                </div>
              ))}
              {sharedExpenses.length > 3 && (
                <p className="text-xs text-brand-500">+{sharedExpenses.length - 3} more</p>
              )}
            </div>
          </div>

          {split && (
            <>
              <div className="px-4 py-3 border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{split.partnerA.displayName} personal</p>
                  <p className="font-semibold text-gray-900">{fmt(partnerAPersonalTotal)}</p>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{split.partnerB.displayName} personal</p>
                  <p className="font-semibold text-gray-900">{fmt(partnerBPersonalTotal)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* P&L Summary */}
        {split && (
          <div className="bg-brand-500 rounded-2xl p-4 text-white">
            <h2 className="font-semibold text-brand-100 text-sm mb-3">Household P&L</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-brand-200 text-xs">Gross income</p>
                <p className="text-xl font-bold">{fmt(split.householdMonthly)}</p>
              </div>
              <div>
                <p className="text-brand-200 text-xs">Total expenses</p>
                <p className="text-xl font-bold">
                  {fmt(totalShared + partnerAPersonalTotal + partnerBPersonalTotal)}
                </p>
              </div>
              <div className="col-span-2 border-t border-brand-400 pt-3">
                <p className="text-brand-200 text-xs">Net (after expenses)</p>
                <p className="text-2xl font-bold">
                  {fmt(
                    split.householdMonthly -
                      totalShared -
                      partnerAPersonalTotal -
                      partnerBPersonalTotal,
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Nav />
    </div>
  );
}
