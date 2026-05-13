import { useSplitSummary } from '../lib/hooks';
import Nav from '../components/Nav';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export default function SplitCalculatorScreen(): JSX.Element {
  const split = useSplitSummary();

  if (!split) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-4 pt-10 pb-4">
          <h1 className="text-xl font-bold text-gray-900">Split Calculator</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Add income for both partners to see the split.</p>
        </div>
        <Nav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 px-4 pt-10 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Split Calculator</h1>
        <p className="text-xs text-gray-400 mt-0.5">May 2026 · based on income ratio</p>
      </header>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Income ratio bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Income Ratio</h2>
          <div className="flex rounded-full overflow-hidden h-4">
            <div
              className="bg-brand-500 h-full"
              style={{ width: pct(split.partnerARatio) }}
            />
            <div
              className="bg-slate-400 h-full"
              style={{ width: pct(split.partnerBRatio) }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span className="text-xs text-gray-600">
                {split.partnerA.displayName} — {pct(split.partnerARatio)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-xs text-gray-600">
                {split.partnerB.displayName} — {pct(split.partnerBRatio)}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly income */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Monthly Income</h2>
          </div>
          <div className="px-4 py-3 flex justify-between border-b border-gray-50">
            <span className="text-sm text-gray-600">{split.partnerA.displayName}</span>
            <span className="text-sm font-semibold text-gray-900">{fmt(split.partnerAMonthly)}</span>
          </div>
          <div className="px-4 py-3 flex justify-between border-b border-gray-50">
            <span className="text-sm text-gray-600">{split.partnerB.displayName}</span>
            <span className="text-sm font-semibold text-gray-900">{fmt(split.partnerBMonthly)}</span>
          </div>
          <div className="px-4 py-3 flex justify-between bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">Household total</span>
            <span className="text-sm font-bold text-gray-900">{fmt(split.householdMonthly)}</span>
          </div>
        </div>

        {/* Fair share of shared expenses */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Shared Expenses</h2>
            <p className="text-xs text-gray-400">Total: {fmt(split.sharedTotal)}</p>
          </div>
          <div className="px-4 py-3 flex justify-between border-b border-gray-50">
            <div>
              <p className="text-sm text-gray-600">{split.partnerA.displayName} fair share</p>
              <p className="text-xs text-gray-400">{pct(split.partnerARatio)} of {fmt(split.sharedTotal)}</p>
            </div>
            <span className="text-sm font-semibold text-gray-900">{fmt(split.partnerAFairShare)}</span>
          </div>
          <div className="px-4 py-3 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">{split.partnerB.displayName} fair share</p>
              <p className="text-xs text-gray-400">{pct(split.partnerBRatio)} of {fmt(split.sharedTotal)}</p>
            </div>
            <span className="text-sm font-semibold text-gray-900">{fmt(split.partnerBFairShare)}</span>
          </div>
        </div>

        {/* What each partner owes this month */}
        <div className="bg-brand-500 rounded-2xl p-4 text-white">
          <h2 className="text-sm font-semibold text-brand-100 mb-3">Who Owes What This Month</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-brand-400/50 rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold">{split.partnerA.displayName}</p>
                <p className="text-xs text-brand-200">
                  {fmt(split.partnerAFairShare)} shared + {fmt(split.partnerAPersonal)} personal
                </p>
              </div>
              <p className="text-xl font-bold">{fmt(split.partnerAOwes)}</p>
            </div>
            <div className="flex items-center justify-between bg-brand-400/50 rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold">{split.partnerB.displayName}</p>
                <p className="text-xs text-brand-200">
                  {fmt(split.partnerBFairShare)} shared + {fmt(split.partnerBPersonal)} personal
                </p>
              </div>
              <p className="text-xl font-bold">{fmt(split.partnerBOwes)}</p>
            </div>
          </div>
        </div>
      </div>

      <Nav />
    </div>
  );
}
