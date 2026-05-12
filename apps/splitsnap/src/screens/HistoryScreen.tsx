import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import { formatCents, relativeTime, getMemberColor, getMemberInitials } from '../lib/utils';
import type { Session, Group } from '../lib/types';

type IouEntry = {
  uid: string;
  name: string;
  balance: number;
  memberIndex: number;
};

function computeIou(sessions: Session[], group: Group, myUid: string): IouEntry[] {
  const balances: Record<string, number> = {};
  group.members.forEach((uid) => { if (uid !== myUid) balances[uid] = 0; });

  for (const session of sessions) {
    const myItems = session.items.filter((i) => i.claimedBy === myUid);
    const myTotal = myItems.reduce((s, i) => s + i.price, 0);
    const claimed = session.items.filter((i) => i.claimedBy !== null);
    const totalClaimed = claimed.reduce((s, i) => s + i.price, 0);
    const myShare = totalClaimed > 0 ? myTotal / totalClaimed : 0;
    const myTip = Math.round(session.tip * myShare);
    const myTax = Math.round(session.tax * myShare);
    const myGrand = myTotal + myTip + myTax;

    if (session.createdBy !== myUid) {
      // I owe the creator
      if (balances[session.createdBy] !== undefined) {
        balances[session.createdBy] -= myGrand;
      }
    } else {
      // Others owe me
      for (const uid of group.members) {
        if (uid === myUid) continue;
        const theirItems = session.items.filter((i) => i.claimedBy === uid);
        const theirTotal = theirItems.reduce((s, i) => s + i.price, 0);
        const theirShare = totalClaimed > 0 ? theirTotal / totalClaimed : 0;
        const theirTip = Math.round(session.tip * theirShare);
        const theirTax = Math.round(session.tax * theirShare);
        if (balances[uid] !== undefined) {
          balances[uid] += theirTotal + theirTip + theirTax;
        }
      }
    }
  }

  return Object.entries(balances).map(([uid, balance]) => ({
    uid,
    name: group.memberNames[uid] ?? 'Unknown',
    balance,
    memberIndex: group.members.indexOf(uid),
  }));
}

export default function HistoryScreen(): JSX.Element {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const user = useAppStore((s) => s.user);
  const groups = useAppStore((s) => s.groups);
  const pastSessions = useAppStore((s) => s.pastSessions);

  const group = groups.find((g) => g.id === groupId) ?? null;
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      setSessions(pastSessions.filter((s) => s.groupId === groupId).slice(0, 10));
      return;
    }
    void (async () => {
      if (!groupId) return;
      const { db } = await import('../lib/firebase');
      const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
      if (!db) return;
      const q = query(
        collection(db, 'groups', groupId, 'sessions'),
        orderBy('createdAt', 'desc'),
        limit(10),
      );
      const snap = await getDocs(q);
      const loaded: Session[] = snap.docs.map((d) => {
        const data = d.data();
        return { ...data, id: d.id, createdAt: data.createdAt?.toDate() ?? new Date() } as Session;
      });
      setSessions(loaded);
    })();
  }, [groupId, pastSessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const iouEntries = group && user ? computeIou(sessions, group, user.uid) : [];

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Group not found</p>
      </div>
    );
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
        <div>
          <h1 className="text-lg font-bold text-gray-900">{group.name}</h1>
          <p className="text-xs text-gray-400">{group.members.length} members</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* IOU Balances */}
        {iouEntries.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">IOU Balances</h2>
            <div className="space-y-2">
              {iouEntries.map((entry) => (
                <div key={entry.uid} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${getMemberColor(entry.memberIndex)} flex items-center justify-center text-white font-bold`}>
                    {getMemberInitials(entry.name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{entry.name}</p>
                    <p className="text-xs text-gray-400">
                      {entry.balance > 0 ? 'owes you' : entry.balance < 0 ? 'you owe' : 'settled up'}
                    </p>
                  </div>
                  <span className={`font-bold text-base ${entry.balance > 0 ? 'text-green-600' : entry.balance < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {entry.balance === 0 ? '–' : formatCents(Math.abs(entry.balance))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Session history */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Recent Splits {sessions.length > 0 && `(${sessions.length})`}
          </h2>
          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
              <p className="text-3xl mb-2">🧾</p>
              <p className="text-sm">No splits yet in this group</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const total = session.subtotal + session.tax + session.tip;
                const myItems = session.items.filter((i) => i.claimedBy === user?.uid);
                const myTotal = myItems.reduce((s, i) => s + i.price, 0);
                const claimed = session.items.filter((i) => i.claimedBy !== null);
                const totalClaimed = claimed.reduce((s, i) => s + i.price, 0);
                const myShare = totalClaimed > 0 ? myTotal / totalClaimed : 0;
                const myGrand = myTotal + Math.round(session.tip * myShare) + Math.round(session.tax * myShare);

                return (
                  <button
                    key={session.id}
                    onClick={() => navigate(`/session/${session.id}/summary`)}
                    className="w-full bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{relativeTime(session.createdAt)}</p>
                        <p className="text-xs text-gray-400">{session.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCents(total)}</p>
                        <p className="text-xs text-brand-600 font-medium">Your share: {formatCents(myGrand)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {group.members.map((uid, i) => (
                          <div
                            key={uid}
                            className={`w-5 h-5 rounded-full ${getMemberColor(i)} flex items-center justify-center text-white text-xs font-bold border border-white`}
                          >
                            {getMemberInitials(group.memberNames[uid] ?? '?')}
                          </div>
                        ))}
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        session.status === 'settled'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {session.status === 'settled' ? 'Settled' : 'Pending'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
