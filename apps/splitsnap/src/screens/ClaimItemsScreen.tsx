import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import { formatCents, getMemberColor, getMemberInitials } from '../lib/utils';
import type { LineItem, Session, Group } from '../lib/types';

export default function ClaimItemsScreen(): JSX.Element {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const user = useAppStore((s) => s.user);
  const groups = useAppStore((s) => s.groups);
  const activeSessions = useAppStore((s) => s.activeSessions);
  const setActiveSessions = useAppStore((s) => s.setActiveSessions);
  const addToast = useAppStore((s) => s.addToast);

  const demoSession = activeSessions.find((s) => s.id === sessionId);
  const [session, setSession] = useState<Session | null>(demoSession ?? null);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      const s = activeSessions.find((sess) => sess.id === sessionId) ?? null;
      setSession(s);
      if (s) setGroup(groups.find((g) => g.id === s.groupId) ?? null);
      return;
    }
    // Live mode: subscribe to Firestore
    let unsubscribe: (() => void) | undefined;
    void (async () => {
      const { db } = await import('../lib/firebase');
      const { doc, onSnapshot } = await import('firebase/firestore');
      if (!db) return;
      // We need to know the groupId — for live mode this comes from the session doc
      // For simplicity, search across all groups the user belongs to
      const allGroups = groups;
      for (const g of allGroups) {
        const ref = doc(db, 'groups', g.id, 'sessions', sessionId ?? '');
        unsubscribe = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setSession({ ...data, id: snap.id, createdAt: data.createdAt?.toDate() ?? new Date() } as Session);
            setGroup(g);
          }
        });
        break;
      }
    })();
    return () => unsubscribe?.();
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  function claimItem(item: LineItem): void {
    if (!session || !user) return;
    const alreadyMine = item.claimedBy === user.uid;
    const newClaimedBy = alreadyMine ? null : user.uid;

    if (isDemoMode) {
      addToast('Demo mode — not saved');
      const updatedItems = session.items.map((i) =>
        i.id === item.id ? { ...i, claimedBy: newClaimedBy } : i,
      );
      const updatedSession = { ...session, items: updatedItems };
      setSession(updatedSession);
      setActiveSessions(activeSessions.map((s) => (s.id === sessionId ? updatedSession : s)));
      return;
    }

    // Live mode: update Firestore
    void (async () => {
      const { db } = await import('../lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      if (!db || !group) return;
      const updatedItems = session.items.map((i) =>
        i.id === item.id ? { ...i, claimedBy: newClaimedBy } : i,
      );
      await updateDoc(doc(db, 'groups', group.id, 'sessions', sessionId ?? ''), {
        items: updatedItems,
      });
    })();
  }

  function getMemberIndex(uid: string): number {
    if (!group) return 0;
    return group.members.indexOf(uid);
  }

  const unclaimedCount = session?.items.filter((i) => i.claimedBy === null).length ?? 0;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/')} className="text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Claim Your Items</h1>
            <p className="text-xs text-gray-400">{group?.name}</p>
          </div>
        </div>
        {unclaimedCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
            {unclaimedCount} item{unclaimedCount !== 1 ? 's' : ''} not yet claimed
          </div>
        )}
      </div>

      {/* Member legend */}
      {group && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex gap-3 overflow-x-auto">
            {group.members.map((uid, i) => (
              <div key={uid} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`w-6 h-6 rounded-full ${getMemberColor(i)} flex items-center justify-center text-white text-xs font-bold`}>
                  {getMemberInitials(group.memberNames[uid] ?? '?')}
                </div>
                <span className="text-xs text-gray-600">{group.memberNames[uid] ?? uid}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {session.items.map((item) => {
          const claimedByMe = item.claimedBy === user?.uid;
          const claimedByOther = item.claimedBy !== null && !claimedByMe;
          const memberIndex = item.claimedBy ? getMemberIndex(item.claimedBy) : -1;
          const memberName = item.claimedBy && group ? (group.memberNames[item.claimedBy] ?? 'Unknown') : null;

          return (
            <button
              key={item.id}
              onClick={() => claimItem(item)}
              className={`w-full rounded-xl p-4 text-left border-2 transition-all ${
                claimedByMe
                  ? 'border-brand-500 bg-brand-50'
                  : claimedByOther
                  ? 'border-transparent bg-gray-100 opacity-70'
                  : 'border-transparent bg-white shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.claimedBy && (
                    <div className={`w-8 h-8 rounded-full ${getMemberColor(memberIndex)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {getMemberInitials(memberName ?? '?')}
                    </div>
                  )}
                  {!item.claimedBy && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    {memberName && (
                      <p className="text-xs text-gray-500">{claimedByMe ? 'Yours' : memberName}</p>
                    )}
                    {!memberName && (
                      <p className="text-xs text-gray-400">Tap to claim</p>
                    )}
                  </div>
                </div>
                <span className={`font-bold ${claimedByMe ? 'text-brand-600' : 'text-gray-700'}`}>
                  {formatCents(item.price)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-gray-100 space-y-3">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Total bill</span>
          <span className="font-semibold text-gray-900">
            {formatCents(session.subtotal + session.tax + session.tip)}
          </span>
        </div>
        <button
          onClick={() => navigate(`/session/${sessionId}/summary`)}
          className="w-full bg-brand-600 text-white rounded-xl py-4 font-bold text-base hover:bg-brand-700 transition-colors"
        >
          View Summary →
        </button>
      </div>
    </div>
  );
}
