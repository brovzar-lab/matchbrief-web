import { useState } from 'react';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';

export default function AuthScreen(): JSX.Element {
  const setUser = useAppStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  function handleDemoLogin(): void {
    setUser({ uid: 'demo-host', isDemo: true });
  }

  async function handleAnonSignIn(): Promise<void> {
    setLoading(true);
    try {
      const { signInAnonymously } = await import('firebase/auth');
      const { auth } = await import('../lib/firebase');
      if (!auth) return;
      const cred = await signInAnonymously(auth);
      setUser({ uid: cred.user.uid, isDemo: false });
    } catch {
      alert('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-600 to-brand-700 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🧾</div>
          <h1 className="text-3xl font-bold text-white">SplitTab</h1>
          <p className="text-orange-100 mt-2 text-sm">
            Scan a receipt. Share a link. Split fairly.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
          {!isDemoMode && (
            <button
              onClick={handleAnonSignIn}
              disabled={loading}
              className="w-full bg-brand-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in…' : 'Get Started'}
            </button>
          )}

          <button
            onClick={handleDemoLogin}
            className="w-full border-2 border-brand-600 text-brand-600 rounded-xl py-3.5 font-semibold text-sm hover:bg-orange-50 transition-colors"
          >
            Continue as Demo User
          </button>

          <p className="text-center text-xs text-gray-400 pt-1">
            No account needed — anonymous sign-in only
          </p>
        </div>
      </div>
    </div>
  );
}
