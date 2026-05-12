import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import { formatCents, buildVenmoLink, buildCashAppLink, getMemberColor, getMemberInitials } from '../lib/utils';
import type { Session, Group } from '../lib/types';

type PersonSummary = {
  uid: string;
  name: string;
  itemsTotal: number;
  tipShare: number;
  taxShare: number;
  grandTotal: number;
  memberIndex: number;
};

function computeSummaries(session: Session, group: Group): PersonSummary[] {
  const claimedItems = session.items.filter((i) => i.claimedBy !== null);
  const totalClaimed = claimedItems.reduce((s, i) => s + i.price, 0);

  return group.members.map((uid, index) => {
    const myItems = session.items.filter((i) => i.claimedBy === uid);
    const itemsTotal = myItems.reduce((s, i) => s + i.price, 0);
    const share = totalClaimed > 0 ? itemsTotal / totalClaimed : 1 / group.members.length;
    const tipShare = Math.round(session.tip * share);
    const taxShare = Math.round(session.tax * share);
    const grandTotal = itemsTotal + tipShare + taxShare;
    return {
      uid,
      name: group.memberNames[uid] ?? 'Unknown',
      itemsTotal,
      tipShare,
      taxShare,
      grandTotal,
      memberIndex: index,
    };
  });
}

export default function SummaryScreen(): JSX.Element {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const user = useAppStore((s) => s.user);
  const userProfile = useAppStore((s) => s.userProfile);
  const groups = useAppStore((s) => s.groups);
  const activeSessions = useAppStore((s) => s.activeSessions);
  const addToast = useAppStore((s) => s.addToast);

  const [session, setSession] = useState<Session | null>(
    activeSessions.find((s) => s.id === sessionId) ?? null,
  );
  const [group, setGroup] = useState<Group | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      const s = activeSessions.find((sess) => sess.id === sessionId) ?? null;
      setSession(s);
      if (s) setGroup(groups.find((g) => g.id === s.groupId) ?? null);
      return;
    }
    void (async () => {
      const { db } = await import('../lib/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      if (!db) return;
      for (const g of groups) {
        const snap = await getDoc(doc(db, 'groups', g.id, 'sessions', sessionId ?? ''));
        if (snap.exists()) {
          const data = snap.data();
          setSession({ ...data, id: snap.id, createdAt: data.createdAt?.toDate() ?? new Date() } as Session);
          setGroup(g);
          break;
        }
      }
    })();
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSettle(person: PersonSummary): Promise<void> {
    if (!group || !userProfile) return;

    const isSettlingForSelf = person.uid === user?.uid;
    const venmoHandle = isSettlingForSelf ? null : (
      group.memberEmails[person.uid]
        ? null
        : userProfile.venmoHandle
    );

    if (venmoHandle) {
      window.location.href = buildVenmoLink(venmoHandle, person.grandTotal, 'SplitSnap');
    } else if (userProfile.cashTag) {
      window.location.href = buildCashAppLink(userProfile.cashTag, person.grandTotal);
    } else {
      const text = `${person.name} owes ${formatCents(person.grandTotal)} — SplitSnap`;
      await navigator.clipboard.writeText(text);
      setCopied(person.uid);
      addToast('Copied to clipboard!');
      setTimeout(() => setCopied(null), 2000);
    }
  }

  if (!session || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading summary…</p>
      </div>
    );
  }

  const summaries = computeSummaries(session, group);
  const total = session.subtotal + session.tax + session.tip;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-brand-600 text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold">Summary</h1>
            <p className="text-orange-200 text-xs">{group.name}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-orange-200 text-sm mb-1">Total Bill</p>
          <p className="text-4xl font-bold">{formatCents(total)}</p>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {summaries.map((person) => {
          const isMe = person.uid === user?.uid;
          return (
            <div
              key={person.uid}
              className={`bg-white rounded-2xl shadow-sm overflow-hidden ${isMe ? 'ring-2 ring-brand-400' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full ${getMemberColor(person.memberIndex)} flex items-center justify-center text-white font-bold`}>
                    {getMemberInitials(person.name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{person.name}{isMe ? ' (You)' : ''}</p>
                    <p className="text-xs text-gray-400">
                      {session.items.filter((i) => i.claimedBy === person.uid).length} items
                    </p>
                  </div>
                  <p className="text-xl font-bold text-brand-600">{formatCents(person.grandTotal)}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-xs text-gray-500 mb-3">
                  <div className="flex justify-between">
                    <span>Items</span><span>{formatCents(person.itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tip share</span><span>{formatCents(person.tipShare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax share</span><span>{formatCents(person.taxShare)}</span>
                  </div>
                </div>

                {!isMe && (
                  <button
                    onClick={() => void handleSettle(person)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      copied === person.uid
                        ? 'bg-green-500 text-white'
                        : 'bg-brand-600 text-white hover:bg-brand-700'
                    }`}
                  >
                    {copied === person.uid ? '✓ Copied!' : '💸 Settle Up'}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Unclaimed items warning */}
        {session.items.some((i) => i.claimedBy === null) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-700 font-medium mb-1">Some items unclaimed</p>
            <p className="text-xs text-amber-600">
              {session.items.filter((i) => i.claimedBy === null).length} items worth{' '}
              {formatCents(session.items.filter((i) => i.claimedBy === null).reduce((s, i) => s + i.price, 0))} have not been assigned.
            </p>
            <button
              onClick={() => navigate(`/session/${sessionId}/claim`)}
              className="mt-2 text-xs text-amber-700 font-semibold underline"
            >
              Go back and claim
            </button>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-100 text-gray-600 rounded-xl py-3 font-semibold text-sm hover:bg-gray-200 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
