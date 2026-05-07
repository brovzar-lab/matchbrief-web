import { useParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { centsToDisplay, computePersonalTotal, computeVenmoLink, computeVenmoWebLink } from '../lib/utils';

export default function PersonalSummaryScreen(): JSX.Element {
  const { sessionId } = useParams<{ sessionId: string }>();
  const items = useAppStore((s) => s.items);
  const session = useAppStore((s) => s.session);
  const guestParticipantId = useAppStore((s) => s.guestParticipantId);
  const participants = useAppStore((s) => s.participants);

  const myId = guestParticipantId ?? 'demo-guest';
  const myParticipant = participants.find((p) => p.id === myId);
  const subtotal = session?.subtotal ?? 0;
  const tax = session?.tax ?? 0;
  const tip = session?.tip ?? 0;

  const myItems = items.filter((i) => i.claimedBy.includes(myId));
  const myItemsTotal = myItems.reduce(
    (sum, i) => sum + Math.round((i.price * i.quantity) / i.claimedBy.length),
    0,
  );
  const total = computePersonalTotal(items, myId, subtotal, tax, tip);
  const taxShare = subtotal > 0 ? Math.round(tax * (myItemsTotal / subtotal)) : 0;
  const tipShare = subtotal > 0 ? Math.round(tip * (myItemsTotal / subtotal)) : 0;
  const venmoHandle = myParticipant?.venmoHandle;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">Your Share</h1>
        <p className="text-sm text-gray-500">Session {sessionId}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-1">You owe</p>
          <p className="text-5xl font-bold text-brand-600">{centsToDisplay(total)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Your Items</h2>
          {myItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600 truncate flex-1 mr-2">
                {item.name}
                {item.claimedBy.length > 1 && (
                  <span className="text-gray-400"> (÷{item.claimedBy.length})</span>
                )}
              </span>
              <span className="text-gray-700 shrink-0">
                {centsToDisplay(
                  Math.round((item.price * item.quantity) / item.claimedBy.length),
                )}
              </span>
            </div>
          ))}
          {myItems.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">No items claimed</p>
          )}
        </div>

        <div className="bg-orange-50 rounded-xl px-4 py-3 text-sm text-gray-700 space-y-1">
          <div className="flex justify-between">
            <span>Items</span>
            <span>{centsToDisplay(myItemsTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (your share)</span>
            <span>{centsToDisplay(taxShare)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tip (your share)</span>
            <span>{centsToDisplay(tipShare)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-orange-200 pt-1 mt-1">
            <span>Total</span>
            <span className="text-brand-600">{centsToDisplay(total)}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-3">
        {venmoHandle ? (
          <>
            <a
              href={computeVenmoLink(venmoHandle, total, sessionId ?? '')}
              className="block w-full text-center bg-[#3D95CE] text-white rounded-xl py-4 font-semibold text-base hover:opacity-90 transition-opacity"
            >
              Pay via Venmo App · {centsToDisplay(total)}
            </a>
            <a
              href={computeVenmoWebLink(venmoHandle)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center border-2 border-[#3D95CE] text-[#3D95CE] rounded-xl py-3.5 font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              Open Venmo Web
            </a>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            <p>The host has not set up a payment link.</p>
            <p className="text-gray-400 text-xs mt-1">Pay them directly — your total is {centsToDisplay(total)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
