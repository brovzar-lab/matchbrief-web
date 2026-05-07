import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';
import { DEMO_OCR_ITEMS } from '../lib/mockData';

export default function ScanningScreen(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const setItems = useAppStore((s) => s.setItems);
  const setSession = useAppStore((s) => s.setSession);
  const session = useAppStore((s) => s.session);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    if (!id) return;

    if (isDemoMode) {
      const timer = setTimeout(() => {
        setItems(DEMO_OCR_ITEMS);
        navigate(`/session/${id}/edit`);
      }, 2000);
      return () => clearTimeout(timer);
    }

    const state = location.state as { imageBase64?: string; sessionId?: string } | null;
    if (!state?.imageBase64) {
      navigate(`/session/${id}/edit`);
      return;
    }

    void (async () => {
      try {
        const { httpsCallable } = await import('firebase/functions');
        const { functions } = await import('../lib/firebase');
        if (!functions) return;

        const ocrFn = httpsCallable<
          { imageBase64: string; sessionId: string },
          { items: Array<{ name: string; price: number; quantity: number }>; receiptImageUrl: string }
        >(functions, 'ocr');

        const result = await ocrFn({ imageBase64: state.imageBase64, sessionId: id });
        const { items: rawItems, receiptImageUrl } = result.data;

        const items = rawItems.map((item, i) => ({
          id: `item-${i + 1}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          claimedBy: [] as string[],
        }));

        setItems(items);
        if (session) {
          setSession({ ...session, receiptImageUrl, status: 'claiming' });
        }

        const { db } = await import('../lib/firebase');
        const { collection, doc, writeBatch } = await import('firebase/firestore');
        if (!db) return;

        const batch = writeBatch(db);
        for (const item of items) {
          batch.set(doc(collection(db, 'sessions', id, 'items'), item.id), {
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            claimedBy: [],
          });
        }
        await batch.commit();

        navigate(`/session/${id}/edit`);
      } catch {
        addToast('OCR failed — add items manually.');
        setItems([]);
        navigate(`/session/${id}/edit`);
      }
    })();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="text-center space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🧾</div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reading your receipt…</h2>
          <p className="text-gray-500 text-sm mt-1">AI is extracting line items</p>
        </div>
        <div className="flex gap-1 justify-center">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
