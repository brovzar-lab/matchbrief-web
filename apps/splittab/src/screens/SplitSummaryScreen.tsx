import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { centsToDisplay, computePersonalTotal, computeVenmoLink } from '../lib/utils';
import type { Item, Participant } from '../lib/types';

function PersonCard({
  participant,
  items,
  subtotal,
  tax,
  tip,
}: {
  participant: Participant;
  items: Item[];
  subtotal: number;
  tax: number;
  tip: number;
}): JSX.Element {
  const myItems = items.filter((i) => i.claimedBy.includes(participant.id));
  const total = computePersonalTotal(items, participant.id, subtotal, tax, tip);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900">{participant.name}</p>
          <p className="text-xs text-gray-400">
            {myItems.length} item{myItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <p className="text-xl font-bold text-brand-600">{centsToDisplay(total)}</p>
      </div>

      <div className="space-y-1 mb-3">
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
      </div>

      {participant.venmoHandle ? (
        <a
          href={computeVenmoLink(participant.venmoHandle, total, participant.id)}
          className="block w-full text-center bg-[#3D95CE] text-white rounded-xl py-3 font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Pay via Venmo · {centsToDisplay(total)}
        </a>
      ) : (
        <p className="text-center text-xs text-gray-400 py-2">No payment link provided</p>
      )}
    </div>
  );
}

export default function SplitSummaryScreen(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const items = useAppStore((s) => s.items);
  const participants = useAppStore((s) => s.participants);
  const session = useAppStore((s) => s.session);

  const subtotal = session?.subtotal ?? 0;
  const tax = session?.tax ?? 0;
  const tip = session?.tip ?? 0;
  const grandTotal = subtotal + tax + tip;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">Split Summary</h1>
        <p className="text-sm text-gray-500">
          Total: {centsToDisplay(grandTotal)} · {participants.length} people
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="bg-orange-50 rounded-xl px-4 py-3 text-sm text-gray-700 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{centsToDisplay(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{centsToDisplay(tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tip</span>
            <span>{centsToDisplay(tip)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-orange-200 pt-1 mt-1">
            <span>Total</span>
            <span className="text-brand-600">{centsToDisplay(grandTotal)}</span>
          </div>
        </div>

        {participants.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No guests have joined yet.</p>
        )}

        {participants.map((p) => (
          <PersonCard
            key={p.id}
            participant={p}
            items={items}
            subtotal={subtotal}
            tax={tax}
            tip={tip}
          />
        ))}
      </div>

      <div className="px-4 py-4 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate(`/session/${id}/claims`)}
          className="w-full border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back to Claims
        </button>
      </div>
    </div>
  );
}
