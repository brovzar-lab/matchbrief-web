import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';
import { centsToDisplay } from '../lib/utils';

export default function LiveClaimView(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const items = useAppStore((s) => s.items);
  const participants = useAppStore((s) => s.participants);
  const setItems = useAppStore((s) => s.setItems);

  useEffect(() => {
    if (!id || isDemoMode) return;

    let unsubItems: (() => void) | undefined;
    void (async () => {
      const { db } = await import('../lib/firebase');
      const { collection, onSnapshot } = await import('firebase/firestore');
      if (!db) return;

      unsubItems = onSnapshot(collection(db, 'sessions', id, 'items'), (snap) => {
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

    return () => unsubItems?.();
  }, [id, setItems]);

  function getClaimersNames(claimedBy: string[]): string {
    if (claimedBy.length === 0) return 'Unclaimed';
    const names = claimedBy
      .map((uid) => participants.find((p) => p.id === uid)?.name ?? 'Guest')
      .join(', ');
    return names;
  }

  const unclaimedCount = items.filter((i) => i.claimedBy.length === 0).length;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">Live Claims</h1>
        <p className="text-sm text-gray-500">
          {participants.length} guest{participants.length !== 1 ? 's' : ''} joined ·{' '}
          {unclaimedCount > 0 ? (
            <span className="text-amber-600">{unclaimedCount} unclaimed</span>
          ) : (
            <span className="text-green-600">all claimed</span>
          )}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl px-4 py-3 shadow-sm border-l-4 ${
              item.claimedBy.length === 0 ? 'border-gray-200' : 'border-green-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{getClaimersNames(item.claimedBy)}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="font-semibold text-gray-900">{centsToDisplay(item.price * item.quantity)}</p>
                {item.claimedBy.length > 1 && (
                  <p className="text-xs text-gray-400">
                    {centsToDisplay(Math.round((item.price * item.quantity) / item.claimedBy.length))} each
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-2">
        <button
          onClick={() => navigate(`/session/${id}/summary`)}
          className="w-full bg-brand-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-brand-700 transition-colors"
        >
          Calculate Split →
        </button>
        <button
          onClick={() => navigate(`/session/${id}/qr`)}
          className="w-full border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back to QR Code
        </button>
      </div>
    </div>
  );
}
