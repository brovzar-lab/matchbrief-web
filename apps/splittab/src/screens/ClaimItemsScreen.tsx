import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';
import { centsToDisplay, computePersonalTotal } from '../lib/utils';
import type { Item } from '../lib/types';

function ClaimRow({
  item,
  isClaimed,
  claimerCount,
  onToggle,
}: {
  item: Item;
  isClaimed: boolean;
  claimerCount: number;
  onToggle: () => void;
}): JSX.Element {
  const displayPrice = claimerCount > 0
    ? Math.round((item.price * item.quantity) / claimerCount)
    : item.price * item.quantity;

  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm transition-all ${
        isClaimed
          ? 'bg-green-50 border-2 border-green-400'
          : 'bg-white border-2 border-transparent'
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isClaimed ? 'bg-green-400 border-green-400' : 'border-gray-300'
        }`}
      >
        {isClaimed && <span className="text-white text-xs font-bold">✓</span>}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`font-medium text-sm truncate ${isClaimed ? 'text-green-800' : 'text-gray-900'}`}>
          {item.name}
          {item.quantity > 1 && <span className="text-gray-400 font-normal"> ×{item.quantity}</span>}
        </p>
        {claimerCount > 1 && (
          <p className="text-xs text-gray-400">{claimerCount} sharing</p>
        )}
      </div>
      <p className={`font-semibold text-sm shrink-0 ${isClaimed ? 'text-green-700' : 'text-gray-700'}`}>
        {centsToDisplay(displayPrice)}
      </p>
    </button>
  );
}

export default function ClaimItemsScreen(): JSX.Element {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const items = useAppStore((s) => s.items);
  const setItems = useAppStore((s) => s.setItems);
  const guestParticipantId = useAppStore((s) => s.guestParticipantId);
  const session = useAppStore((s) => s.session);
  const addToast = useAppStore((s) => s.addToast);

  const myId = guestParticipantId ?? 'demo-guest';

  useEffect(() => {
    if (!sessionId || isDemoMode) return;

    let unsub: (() => void) | undefined;
    void (async () => {
      const { db } = await import('../lib/firebase');
      const { collection, onSnapshot } = await import('firebase/firestore');
      if (!db) return;

      unsub = onSnapshot(collection(db, 'sessions', sessionId, 'items'), (snap) => {
        setItems(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name as string,
            price: d.data().price as number,
            quantity: d.data().quantity as number,
            claimedBy: (d.data().claimedBy as string[]) ?? [],
          })),
        );
      });
    })();

    return () => unsub?.();
  }, [sessionId, setItems]);

  async function toggleClaim(item: Item): Promise<void> {
    const alreadyClaimed = item.claimedBy.includes(myId);
    const newClaimedBy = alreadyClaimed
      ? item.claimedBy.filter((id) => id !== myId)
      : [...item.claimedBy, myId];

    setItems(items.map((i) => (i.id === item.id ? { ...i, claimedBy: newClaimedBy } : i)));

    if (isDemoMode) {
      addToast('Demo mode — not saved');
      return;
    }

    try {
      const { db } = await import('../lib/firebase');
      const { doc, updateDoc, arrayUnion, arrayRemove } = await import('firebase/firestore');
      if (!db || !sessionId) return;

      await updateDoc(doc(db, 'sessions', sessionId, 'items', item.id), {
        claimedBy: alreadyClaimed ? arrayRemove(myId) : arrayUnion(myId),
      });
    } catch {
      setItems(items.map((i) => (i.id === item.id ? item : i)));
      addToast('Failed to update claim. Please try again.');
    }
  }

  const myTotal = computePersonalTotal(
    items,
    myId,
    session?.subtotal ?? 0,
    session?.tax ?? 0,
    session?.tip ?? 0,
  );
  const myClaimed = items.filter((i) => i.claimedBy.includes(myId)).length;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">Claim Your Items</h1>
        <p className="text-sm text-gray-500">
          Tap items you ordered · {myClaimed} claimed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {items.map((item) => (
          <ClaimRow
            key={item.id}
            item={item}
            isClaimed={item.claimedBy.includes(myId)}
            claimerCount={item.claimedBy.length}
            onToggle={() => void toggleClaim(item)}
          />
        ))}
      </div>

      <div className="px-4 py-4 bg-white border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Your running total</span>
          <span className="text-lg font-bold text-brand-600">{centsToDisplay(myTotal)}</span>
        </div>
        <button
          onClick={() => navigate(`/join/${sessionId}/pay`)}
          disabled={myClaimed === 0}
          className="w-full bg-brand-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          Done Claiming →
        </button>
      </div>
    </div>
  );
}
