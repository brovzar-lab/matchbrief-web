import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';
import { centsToDisplay, generateSessionId } from '../lib/utils';
import type { Item } from '../lib/types';

function ItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: Item;
  onUpdate: (updated: Item) => void;
  onRemove: () => void;
}): JSX.Element {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [priceStr, setPriceStr] = useState((item.price / 100).toFixed(2));
  const [qty, setQty] = useState(String(item.quantity));

  function save(): void {
    const price = Math.round(parseFloat(priceStr) * 100) || 0;
    const quantity = parseInt(qty) || 1;
    onUpdate({ ...item, name: name.trim() || item.name, price, quantity });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="bg-orange-50 rounded-xl p-3 space-y-2">
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          autoFocus
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Price ($)</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              type="number"
              step="0.01"
              min="0"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
            />
          </div>
          <div className="w-20">
            <label className="text-xs text-gray-500 mb-1 block">Qty</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={save}
            className="flex-1 bg-brand-600 text-white rounded-lg py-2 text-sm font-semibold"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-gray-500">
          {centsToDisplay(item.price)}
          {item.quantity > 1 && ` × ${item.quantity}`}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="text-brand-600 text-sm font-medium hover:underline"
        >
          Edit
        </button>
        <button onClick={onRemove} className="text-red-500 text-sm font-medium hover:underline">
          Remove
        </button>
      </div>
    </div>
  );
}

export default function EditItemsScreen(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const items = useAppStore((s) => s.items);
  const setItems = useAppStore((s) => s.setItems);
  const session = useAppStore((s) => s.session);
  const setSession = useAppStore((s) => s.setSession);
  const addToast = useAppStore((s) => s.addToast);

  const [subtotalStr, setSubtotalStr] = useState(
    session ? (session.subtotal / 100).toFixed(2) : '0.00',
  );
  const [taxStr, setTaxStr] = useState(session ? (session.tax / 100).toFixed(2) : '0.00');
  const [tipStr, setTipStr] = useState(session ? (session.tip / 100).toFixed(2) : '0.00');

  function addItem(): void {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: 'New Item',
      price: 0,
      quantity: 1,
      claimedBy: [],
    };
    setItems([...items, newItem]);
  }

  function updateItem(updated: Item): void {
    setItems(items.map((i) => (i.id === updated.id ? updated : i)));
  }

  function removeItem(itemId: string): void {
    setItems(items.filter((i) => i.id !== itemId));
  }

  async function handleGenerateQR(): Promise<void> {
    const subtotal = Math.round(parseFloat(subtotalStr) * 100) || 0;
    const tax = Math.round(parseFloat(taxStr) * 100) || 0;
    const tip = Math.round(parseFloat(tipStr) * 100) || 0;

    if (isDemoMode) {
      addToast('Demo mode — not saved');
      if (session) {
        setSession({ ...session, subtotal, tax, tip, status: 'claiming' });
      }
      navigate(`/session/${id ?? 'demo-session-1'}/qr`);
      return;
    }

    try {
      const sessionId = id ?? generateSessionId();
      const { db } = await import('../lib/firebase');
      const { doc, updateDoc, collection, writeBatch } = await import('firebase/firestore');
      if (!db) return;

      await updateDoc(doc(db, 'sessions', sessionId), {
        subtotal,
        tax,
        tip,
        status: 'claiming',
      });

      const batch = writeBatch(db);
      for (const item of items) {
        batch.set(doc(collection(db, 'sessions', sessionId, 'items'), item.id), {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          claimedBy: item.claimedBy,
        });
      }
      await batch.commit();

      if (session) {
        setSession({ ...session, subtotal, tax, tip, status: 'claiming' });
      }

      navigate(`/session/${sessionId}/qr`);
    } catch {
      addToast('Failed to save. Please try again.');
    }
  }

  const itemTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">Review Items</h1>
        <p className="text-sm text-gray-500">{items.length} items · {centsToDisplay(itemTotal)}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {items.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            No items yet. Add them below.
          </p>
        )}
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onUpdate={updateItem}
            onRemove={() => removeItem(item.id)}
          />
        ))}

        <button
          onClick={addItem}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
        >
          + Add Item
        </button>

        <div className="bg-white rounded-xl shadow-sm p-4 mt-4 space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">Tax & Tip</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Subtotal', value: subtotalStr, set: setSubtotalStr },
              { label: 'Tax', value: taxStr, set: setTaxStr },
              { label: 'Tip', value: tipStr, set: setTipStr },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="text-xs text-gray-500 mb-1 block">{label} ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 bg-white border-t border-gray-100">
        <button
          onClick={() => void handleGenerateQR()}
          className="w-full bg-brand-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-brand-700 transition-colors"
        >
          Generate Split Link →
        </button>
      </div>
    </div>
  );
}
