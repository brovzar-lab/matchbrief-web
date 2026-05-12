import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';

export default function SettingsScreen(): JSX.Element {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const userProfile = useAppStore((s) => s.userProfile);
  const setUserProfile = useAppStore((s) => s.setUserProfile);
  const setUser = useAppStore((s) => s.setUser);
  const isPro = useAppStore((s) => s.isPro);
  const setShowPaywall = useAppStore((s) => s.setShowPaywall);
  const addToast = useAppStore((s) => s.addToast);

  const [venmo, setVenmo] = useState(userProfile?.venmoHandle ?? '');
  const [cashTag, setCashTag] = useState(userProfile?.cashTag ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave(): Promise<void> {
    if (isDemoMode) {
      addToast('Demo mode — not saved');
      return;
    }
    if (!user || !userProfile) return;
    setSaving(true);
    try {
      const { db } = await import('../lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      if (!db) return;
      await updateDoc(doc(db, 'users', user.uid), {
        venmoHandle: venmo.trim() || null,
        cashTag: cashTag.trim() || null,
      });
      setUserProfile({ ...userProfile, venmoHandle: venmo.trim() || null, cashTag: cashTag.trim() || null });
      addToast('Profile saved');
    } catch {
      addToast('Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    if (isDemoMode) {
      setUser(null);
      return;
    }
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../lib/firebase');
      if (!auth) return;
      await signOut(auth);
      setUser(null);
    } catch {
      addToast('Sign out failed.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Settings</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Profile */}
        <section className="bg-white rounded-2xl shadow-sm p-4 space-y-1">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Profile</h2>
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
              {(user?.displayName ?? user?.email ?? 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.displayName ?? 'User'}</p>
              <p className="text-sm text-gray-400">{user?.email ?? 'demo@splitsnap.app'}</p>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Venmo Handle</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <span className="text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  value={venmo}
                  onChange={(e) => setVenmo(e.target.value)}
                  placeholder="your-venmo"
                  className="flex-1 text-sm focus:outline-none text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">CashApp $Cashtag</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <span className="text-gray-400 text-sm">$</span>
                <input
                  type="text"
                  value={cashTag}
                  onChange={(e) => setCashTag(e.target.value)}
                  placeholder="yourcashtag"
                  className="flex-1 text-sm focus:outline-none text-gray-900"
                />
              </div>
            </div>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="w-full bg-brand-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{isPro ? 'SplitSnap Pro' : 'Free Plan'}</p>
              <p className="text-xs text-gray-400">
                {isPro ? 'Unlimited group size' : 'Up to 4 people per split'}
              </p>
            </div>
            {!isPro && (
              <button
                onClick={() => setShowPaywall(true)}
                className="bg-brand-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-brand-700 transition-colors"
              >
                Upgrade
              </button>
            )}
            {isPro && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-2 rounded-xl">Pro ✓</span>
            )}
          </div>
        </section>

        {/* About */}
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">About</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Version</span><span className="text-gray-400">0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Mode</span>
              <span className={isDemoMode ? 'text-amber-500 font-medium' : 'text-green-600 font-medium'}>
                {isDemoMode ? 'Demo' : 'Live'}
              </span>
            </div>
          </div>
        </section>

        {/* Sign out */}
        <button
          onClick={() => void handleSignOut()}
          className="w-full bg-red-50 text-red-500 rounded-xl py-3.5 font-semibold text-sm hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
