import { useState } from 'react';
import { isDemoMode } from '../lib/demo';
import { presentPaywall } from '../lib/revenuecat';
import { useAppStore } from '../lib/store';

type Props = {
  onClose: () => void;
};

export default function PaywallModal({ onClose }: Props): JSX.Element {
  const [loading, setLoading] = useState(false);
  const addToast = useAppStore((s) => s.addToast);
  const setIsPremium = useAppStore((s) => s.setIsPremium);

  async function handleUpgrade(): Promise<void> {
    if (isDemoMode) {
      addToast('Demo mode — purchase not available');
      return;
    }
    setLoading(true);
    try {
      const purchased = await presentPaywall();
      if (purchased) {
        setIsPremium(true);
        addToast('Welcome to Premium! All features unlocked.');
        onClose();
      }
    } catch {
      addToast('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const features = [
    'Expense categorization & reports',
    'Goal tracking with contributions',
    'PDF monthly report export',
    'Unlimited income sources',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">🌿</div>
          <h2 className="text-xl font-bold text-gray-900">Unlock HouseFlow Premium</h2>
          <p className="text-sm text-gray-500 mt-1">
            Free trial includes income entry only. Premium unlocks everything.
          </p>
        </div>

        <div className="bg-brand-50 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Monthly</p>
              <p className="text-xs text-gray-500">Cancel anytime</p>
            </div>
            <span className="text-xl font-bold text-brand-500">
              $5.99<span className="text-sm font-normal text-gray-500">/mo</span>
            </span>
          </div>
          <div className="border-t border-brand-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Annual</p>
              <p className="text-xs text-gray-500">Save 30%</p>
            </div>
            <span className="text-xl font-bold text-brand-500">
              $49.99<span className="text-sm font-normal text-gray-500">/yr</span>
            </span>
          </div>
        </div>

        <ul className="space-y-1.5 text-sm text-gray-700 mb-5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-brand-500 font-bold">✓</span> {f}
            </li>
          ))}
        </ul>

        <button
          onClick={() => void handleUpgrade()}
          disabled={loading}
          className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-600 disabled:opacity-50 transition-colors mb-2"
        >
          {loading ? 'Processing…' : 'Upgrade to Premium'}
        </button>
        <button
          onClick={onClose}
          className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
