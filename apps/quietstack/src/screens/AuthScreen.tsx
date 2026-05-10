import { useState } from 'react';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';
import { initRevenueCat } from '../lib/revenuecat';
import { DEMO_RATE_LIMIT } from '../lib/mockData';

export default function AuthScreen(): JSX.Element {
  const setUser = useAppStore((s) => s.setUser);
  const setRateLimitInfo = useAppStore((s) => s.setRateLimitInfo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleDemoLogin(): void {
    setUser({ uid: 'demo-user', email: null, displayName: 'Demo User', isDemo: true });
    setRateLimitInfo(DEMO_RATE_LIMIT);
  }

  async function handleGoogleSignIn(): Promise<void> {
    setLoading(true);
    setError('');
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const { auth } = await import('../lib/firebase');
      if (!auth) return;
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const u = cred.user;
      setUser({ uid: u.uid, email: u.email, displayName: u.displayName, isDemo: false });
      initRevenueCat(u.uid);
    } catch {
      setError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-700 to-brand-800 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🧘</div>
          <h1 className="text-3xl font-bold text-white">QuietStack</h1>
          <p className="text-brand-200 mt-2 text-sm">
            Read less. Understand more.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
          {!isDemoMode && (
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl py-3.5 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>
          )}

          <button
            onClick={handleDemoLogin}
            className="w-full border-2 border-brand-600 text-brand-600 rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-50 transition-colors"
          >
            Continue as Demo User
          </button>

          {error && <p className="text-center text-xs text-red-500">{error}</p>}

          <p className="text-center text-xs text-gray-400 pt-1">
            Your syntheses are private and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
