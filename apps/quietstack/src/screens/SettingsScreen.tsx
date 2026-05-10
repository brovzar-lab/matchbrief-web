import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';

export default function SettingsScreen(): JSX.Element {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const rateLimitInfo = useAppStore((s) => s.rateLimitInfo);
  const setUser = useAppStore((s) => s.setUser);
  const setShowPaywall = useAppStore((s) => s.setShowPaywall);
  const addToast = useAppStore((s) => s.addToast);

  async function handleSignOut(): Promise<void> {
    if (isDemoMode) {
      setUser(null);
      navigate('/auth');
      return;
    }
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../lib/firebase');
      if (!auth) return;
      await signOut(auth);
      setUser(null);
      navigate('/auth');
    } catch {
      addToast('Sign out failed. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-300 transition-colors"
          >
            ←
          </button>
          <h1 className="text-lg font-bold text-gray-900">Settings</h1>
        </div>

        {/* Account */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Account
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">
              {user?.displayName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.displayName ?? 'Demo User'}
              </p>
              <p className="text-xs text-gray-400">{user?.email ?? 'demo@example.com'}</p>
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Plan
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {rateLimitInfo?.tier === 'pro' ? 'Pro' : 'Free'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {rateLimitInfo
                  ? `${rateLimitInfo.used} / ${rateLimitInfo.limit} syntheses used this month`
                  : 'Loading…'}
              </p>
            </div>
            {rateLimitInfo?.tier === 'free' && (
              <button
                onClick={() => setShowPaywall(true)}
                className="bg-brand-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
              >
                Upgrade $8/mo
              </button>
            )}
            {rateLimitInfo?.tier === 'pro' && (
              <span className="text-xs bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full font-semibold">
                Pro ✓
              </span>
            )}
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => void handleSignOut()}
          className="w-full bg-white border border-gray-200 text-red-500 rounded-2xl py-3.5 font-semibold text-sm hover:bg-red-50 hover:border-red-200 transition-colors mt-2"
        >
          Sign Out
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">QuietStack v0.1.0</p>
      </div>
    </div>
  );
}
