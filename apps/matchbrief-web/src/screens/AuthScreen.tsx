import { useState } from 'react';
import { isDemoMode } from '../lib/config';
import { useStore } from '../lib/store';
import { signIn, signUp } from '../lib/firebase';
import { DEMO_USER } from '../demo/seed';

export default function AuthScreen() {
  const setUser = useStore((s) => s.setUser);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-7">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">MatchBrief</h1>
          <p className="text-slate-500 text-base">AI-powered job application coach</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['Match Score', 'Keyword Analysis', 'Bullet Rewrites', 'Cover Letters'].map((f) => (
            <span
              key={f}
              className="bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1.5 text-xs font-semibold text-indigo-600"
            >
              {f}
            </span>
          ))}
        </div>

        {isDemoMode ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
            <p className="text-accent font-bold text-base">Demo Mode Active</p>
            <p className="text-slate-500 text-sm leading-relaxed">
              Pre-loaded with a fintech SE analysis — score 78, full keyword chips, bullet rewrites, and 3 cover letter variants.
            </p>
            <button
              onClick={() => setUser(DEMO_USER)}
              className="w-full bg-accent text-white rounded-2xl py-4 font-bold text-base hover:bg-indigo-700 transition-colors"
            >
              Continue as Demo User →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-1">
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    mode === m ? 'bg-accent text-white' : 'bg-white text-slate-500'
                  }`}
                >
                  {m === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent"
            />

            {error && (
              <p className="text-red-500 text-xs px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white rounded-2xl py-4 font-bold text-base hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
