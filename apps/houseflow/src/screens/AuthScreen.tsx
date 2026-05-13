import { useState } from 'react';
import { isDemoMode } from '../lib/demo';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAppStore } from '../lib/store';
import { DEMO_USER } from '../lib/mockData';

type Flow = 'choose' | 'join';

export default function AuthScreen(): JSX.Element {
  const [flow, setFlow] = useState<Flow>('choose');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useAppStore((s) => s.setUser);
  const addToast = useAppStore((s) => s.addToast);

  async function handleGoogleSignIn(): Promise<void> {
    if (!auth) return;
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        isDemo: false,
      });
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin(): void {
    setUser(DEMO_USER);
    addToast('Signed in as demo user');
  }

  async function handleJoinHousehold(): Promise<void> {
    if (!inviteCode.trim()) {
      setError('Enter a valid invite code.');
      return;
    }
    addToast('Demo mode — join flow not wired to Firebase');
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">🏡</div>
            <h1 className="text-3xl font-bold text-gray-900">HouseFlow</h1>
            <p className="text-gray-500 mt-2">Shared finances, made simple</p>
          </div>

          {flow === 'choose' && (
            <div className="space-y-3">
              {isDemoMode ? (
                <button
                  onClick={handleDemoLogin}
                  className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-600 transition-colors"
                >
                  Continue as Demo User
                </button>
              ) : (
                <button
                  onClick={() => void handleGoogleSignIn()}
                  disabled={loading}
                  className="w-full border border-gray-200 bg-white text-gray-800 rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {loading ? 'Signing in…' : 'Continue with Google'}
                </button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
                  or
                </div>
              </div>

              <button
                onClick={() => setFlow('join')}
                className="w-full border border-brand-200 text-brand-600 rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-50 transition-colors"
              >
                Join with Invite Code
              </button>
            </div>
          )}

          {flow === 'join' && (
            <div className="space-y-4">
              <button
                onClick={() => { setFlow('choose'); setError(''); }}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                ← Back
              </button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HF9K2M"
                  maxLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={() => void handleJoinHousehold()}
                disabled={loading}
                className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Joining…' : 'Join Household'}
              </button>
            </div>
          )}

          {error && flow === 'choose' && (
            <p className="text-sm text-red-500 text-center mt-3">{error}</p>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-8">
        Shared finances, split fairly.
      </p>
    </div>
  );
}
