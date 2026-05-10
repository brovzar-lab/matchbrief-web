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
  const setRateLimitInfo = useAppStore((s) => s.setRateLimitInfo);

  async function handleUpgrade(): Promise<void> {
    if (isDemoMode) {
      addToast('Demo mode — purchase not available');
      return;
    }
    setLoading(true);
    try {
      const purchased = await presentPaywall();
      if (purchased) {
        setRateLimitInfo({ used: 0, limit: 50, tier: 'pro' });
        addToast('Welcome to Pro! 50 syntheses/month unlocked.');
        onClose();
      }
    } catch {
      addToast('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">⚡</div>
          <h2 className="text-xl font-bold text-gray-900">Upgrade to Pro</h2>
          <p className="text-sm text-gray-500 mt-1">
            You've used all your free syntheses this month.
          </p>
        </div>

        <div className="bg-brand-50 rounded-2xl p-4 mb-5">
          <div className="text-center mb-3">
            <span className="text-3xl font-bold text-brand-700">$8</span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>
          <ul className="space-y-1.5 text-sm text-gray-700">
            {[
              '50 syntheses per month',
              'URL paste + PDF upload',
              'Full synthesis library',
              'Priority processing',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-brand-600">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-brand-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors mb-2"
        >
          {loading ? 'Processing…' : 'Upgrade Now'}
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
