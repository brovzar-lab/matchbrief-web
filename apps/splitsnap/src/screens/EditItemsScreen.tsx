import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import { formatCents, generateId } from '../lib/utils';
import { DEMO_OCR_ITEMS } from '../lib/mockData';
import type { LineItem } from '../lib/types';

export default function EditItemsScreen(): JSX.Element {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const pendingItemsFromStore = useAppStore((s) => s.pendingItems);
  const setPendingItems = useAppStore((s) => s.setPendingItems);
  const addToast = useAppStore((s) => s.addToast);

  const initialItems = pendingItemsFromStore.length > 0 ? pendingItemsFromStore : (isDemoMode ? DEMO_OCR_ITEMS : []);
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [taxCents, setTaxCents] = useState(792);
  const [tipPercent, setTipPercent] = useState(20);
  const [addingItem, setAddingItem] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const tipCents = Math.round((subtotal * tipPercent) / 100);
  const total = subtotal + taxCents + tipCents;

  function updateItem(id: string, field: 'name' | 'price', value: string): void {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, [field]: field === 'price' ? Math.round(parseFloat(value || '0') * 100) : value }
          : item,
      ),
    );
  }

  function removeItem(id: string): void {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function addItem(): void {
    if (!newName.trim() || !newPrice.trim()) {
      addToast('Enter item name and price');
      return;
    }
    const price = Math.round(parseFloat(newPrice) * 100);
    if (isNaN(price) || price <= 0) { addToast('Invalid price'); return; }
    setItems((prev) => [...prev, { id: generateId(), name: newName.trim(), price, claimedBy: null }]);
    setNewName('');
    setNewPrice('');
    setAddingItem(false);
  }

  function handleNext(): void {
    if (items.length === 0) { addToast('Add at least one item'); return; }
    setPendingItems(items.map((i) => ({ ...i, claimedBy: null })));
    if (isDemoMode) {
      navigate(`/session/${sessionId ?? 'demo-session-new'}/assign`, {
        state: { taxCents, tipCents },
      });
    } else {
      navigate(`/session/${sessionId ?? 'new'}/assign`, {
        state: { taxCents, tipCents },
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Edit Items</h1>
        <span className="text-sm text-gray-400">{items.length} items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Items list */}
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                className="w-full text-sm font-medium text-gray-900 bg-transparent focus:outline-none border-b border-transparent focus:border-brand-400"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={(item.price / 100).toFixed(2)}
                  onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                  className="w-20 text-sm text-brand-600 font-semibold bg-transparent focus:outline-none border-b border-transparent focus:border-brand-400"
                />
              </div>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-gray-300 hover:text-red-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add item form */}
        {addingItem ? (
          <div className="bg-white rounded-xl shadow-sm p-3 space-y-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Item name"
              autoFocus
              className="w-full text-sm text-gray-900 border-b border-gray-200 focus:outline-none focus:border-brand-400 pb-1"
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Price"
                onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
                className="flex-1 text-sm border-b border-gray-200 focus:outline-none focus:border-brand-400 pb-1"
              />
              <button onClick={addItem} className="text-brand-600 text-sm font-semibold">Add</button>
              <button onClick={() => setAddingItem(false)} className="text-gray-400 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingItem(true)}
            className="w-full bg-white rounded-xl shadow-sm p-3 text-brand-600 font-semibold text-sm flex items-center gap-2 hover:bg-brand-50 transition-colors"
          >
            <span className="text-lg">+</span> Add Item Manually
          </button>
        )}

        {/* Tax & Tip */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3 mt-4">
          <h3 className="font-semibold text-gray-900 text-sm">Tax & Tip</h3>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Tax ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={(taxCents / 100).toFixed(2)}
              onChange={(e) => setTaxCents(Math.round(parseFloat(e.target.value || '0') * 100))}
              className="w-24 text-right text-sm border-b border-gray-200 focus:outline-none focus:border-brand-400 pb-1"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Tip (%)</label>
            <div className="flex gap-2">
              {[0, 15, 18, 20, 25].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setTipPercent(pct)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    tipPercent === pct
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-brand-50 rounded-xl p-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span><span>{formatCents(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span><span>{formatCents(taxCents)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tip ({tipPercent}%)</span><span>{formatCents(tipCents)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-brand-200 pt-1 mt-1">
            <span>Total</span><span className="text-brand-600">{formatCents(total)}</span>
          </div>
        </div>
      </div>

      {/* Next button */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={handleNext}
          className="w-full bg-brand-600 text-white rounded-xl py-4 font-bold text-base hover:bg-brand-700 transition-colors"
        >
          Next: Pick Group →
        </button>
      </div>
    </div>
  );
}
