import { useAppStore } from '../lib/store';

type Props = {
  onUpgradeClick: () => void;
};

export default function UsageBadge({ onUpgradeClick }: Props): JSX.Element | null {
  const info = useAppStore((s) => s.rateLimitInfo);
  if (!info) return null;

  const pct = Math.min((info.used / info.limit) * 100, 100);
  const isNearLimit = info.used >= info.limit - 1;

  return (
    <div className={`rounded-xl p-3 text-sm ${isNearLimit ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-medium text-gray-700">
          {info.tier === 'pro' ? 'Pro' : 'Free'} — {info.used}/{info.limit} this month
        </span>
        {info.tier === 'free' && (
          <button
            onClick={onUpgradeClick}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Upgrade →
          </button>
        )}
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-red-500' : 'bg-brand-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
