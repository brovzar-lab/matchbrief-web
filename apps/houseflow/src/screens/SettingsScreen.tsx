import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import Nav from '../components/Nav';

export default function SettingsScreen(): JSX.Element {
  const user = useAppStore((s) => s.user);
  const household = useAppStore((s) => s.household);
  const members = useAppStore((s) => s.members);
  const isPremium = useAppStore((s) => s.isPremium);
  const setShowPaywall = useAppStore((s) => s.setShowPaywall);
  const setUser = useAppStore((s) => s.setUser);
  const addToast = useAppStore((s) => s.addToast);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteCode = household?.inviteCode ?? '——';

  async function handleSignOut(): Promise<void> {
    if (isDemoMode || !auth) {
      setUser(null);
      return;
    }
    try {
      await signOut(auth);
      setUser(null);
    } catch {
      addToast('Sign-out failed. Try again.');
    }
  }

  async function handleCopyInvite(): Promise<void> {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Could not copy to clipboard.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 px-4 pt-10 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </header>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Profile</p>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg">
              {(user?.displayName ?? 'U')[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.displayName ?? 'User'}</p>
              <p className="text-xs text-gray-400">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>

        {/* Household */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Household</p>
          </div>
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs text-gray-400">Name</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{household?.name ?? '—'}</p>
          </div>
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs text-gray-400">Members</p>
            <div className="mt-1 space-y-1">
              {members.map((m) => (
                <div key={m.userId} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${m.color === 'partner-a' ? 'bg-brand-500' : 'bg-slate-400'}`}
                  />
                  <p className="text-sm text-gray-800">
                    {m.displayName}
                    <span className="text-gray-400 capitalize ml-1">· {m.employmentType}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Invite partner</p>
                {showInviteCode ? (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl font-mono font-bold text-brand-600 tracking-widest">
                      {inviteCode}
                    </p>
                    <button
                      onClick={() => void handleCopyInvite()}
                      className="text-xs text-brand-500 underline"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 mt-0.5">Share your invite code</p>
                )}
              </div>
              <button
                onClick={() => setShowInviteCode(!showInviteCode)}
                className="text-sm text-brand-500 font-medium"
              >
                {showInviteCode ? 'Hide' : 'Show code'}
              </button>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Subscription</p>
          </div>
          <div className="px-4 py-3">
            {isPremium ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-gray-900">HouseFlow Premium</p>
                  <p className="text-xs text-gray-400">All features unlocked</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">Free Trial</p>
                  <p className="text-xs text-gray-400">
                    Income tracking only. Upgrade for expenses, goals & PDF reports.
                  </p>
                </div>
                <button
                  onClick={() => setShowPaywall(true)}
                  className="w-full bg-brand-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-600 transition-colors"
                >
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => void handleSignOut()}
          className="w-full bg-white border border-gray-200 text-red-500 rounded-2xl py-3.5 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <Nav />
    </div>
  );
}
