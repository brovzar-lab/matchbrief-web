import { isDemoMode, FREE_ANALYSIS_LIMIT } from '../lib/config';
import { useStore } from '../lib/store';
import DemoModeBadge from '../components/DemoModeBadge';
import { signOutUser } from '../lib/firebase';

export default function SettingsScreen() {
  const user = useStore((s) => s.user);
  const analyses = useStore((s) => s.analyses);
  const signOut = useStore((s) => s.signOut);

  async function handleSignOut() {
    if (isDemoMode) {
      signOut();
    } else {
      await signOutUser();
    }
  }

  const usagePercent = user
    ? Math.min(100, (user.analysisCount / FREE_ANALYSIS_LIMIT) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      {isDemoMode && <DemoModeBadge />}
      <div className="px-5 py-5 space-y-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xl shrink-0">
            {user?.displayName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 truncate">{user?.displayName ?? 'Unknown'}</p>
            <p className="text-sm text-slate-400 truncate">{user?.email ?? 'No email'}</p>
          </div>
          {user?.tier === 'pro' && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full shrink-0">
              Pro
            </span>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Usage</p>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-accent">{analyses.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total runs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-accent">{user?.analysisCount ?? 0}</p>
              <p className="text-xs text-slate-400 mt-0.5">This month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-accent">
                {user?.tier === 'pro' ? '∞' : FREE_ANALYSIS_LIMIT}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Monthly limit</p>
            </div>
          </div>

          {user?.tier !== 'pro' && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Free tier usage</span>
                <span>{user?.analysisCount ?? 0} / {FREE_ANALYSIS_LIMIT}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {isDemoMode && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-sm font-semibold text-accent mb-1">Running in Demo Mode</p>
            <p className="text-xs text-indigo-500 leading-relaxed">
              Data is not saved. Connect Firebase credentials to enable full functionality.
            </p>
          </div>
        )}

        {user?.tier !== 'pro' && (
          <div className="bg-gradient-to-br from-accent to-indigo-700 rounded-2xl p-5 text-white">
            <p className="font-bold text-lg mb-1">Upgrade to Pro</p>
            <p className="text-sm text-indigo-100 mb-3">
              Unlimited analyses, full history, PDF exports, and priority processing.
            </p>
            <p className="text-sm font-semibold">$9.99 / month</p>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full py-3.5 rounded-2xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-100 transition-colors"
        >
          {isDemoMode ? 'Reset Demo' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
