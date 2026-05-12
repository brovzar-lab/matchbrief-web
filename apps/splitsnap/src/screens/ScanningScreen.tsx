import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';
import { generateId } from '../lib/utils';
import type { LineItem, OcrItem } from '../lib/types';

type LocationState = {
  base64?: string;
  demo?: boolean;
};

export default function ScanningScreen(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: sessionId } = useParams<{ id: string }>();
  const state = location.state as LocationState | null;
  const setPendingItems = useAppStore((s) => s.setPendingItems);
  const addToast = useAppStore((s) => s.addToast);
  const [phase, setPhase] = useState<'uploading' | 'scanning' | 'done' | 'error'>('uploading');
  const [rawText, setRawText] = useState('');

  useEffect(() => {
    if (isDemoMode || state?.demo) {
      runDemoScan();
    } else if (state?.base64) {
      void runOcrScan(state.base64);
    } else {
      navigate(-1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function runDemoScan(): void {
    setTimeout(() => setPhase('scanning'), 600);
    setTimeout(() => {
      setRawText('Margherita Pizza  22.00\nCaesar Salad  14.00\nBBQ Burger  18.00\nPasta Carbonara  16.00\nDiet Coke x2  12.00\nSparkling Water  6.00\nSubtotal  88.00\nTax  7.92\nTip  17.16');
      setPhase('done');
      setTimeout(() => navigate(`/session/${sessionId ?? 'demo-session-new'}/edit`), 1200);
    }, 2500);
  }

  async function runOcrScan(base64: string): Promise<void> {
    setPhase('scanning');
    try {
      const { httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../lib/firebase');
      if (!functions) { navigate(-1); return; }

      const ocrReceipt = httpsCallable<{ imageBase64: string; sessionId: string }, { items: OcrItem[]; rawText: string }>(
        functions,
        'ocrReceipt',
      );
      const result = await ocrReceipt({ imageBase64: base64, sessionId: sessionId ?? 'new' });
      const items: LineItem[] = result.data.items.map((item) => ({
        id: generateId(),
        name: item.name,
        price: Math.round(item.price * 100),
        claimedBy: null,
      }));
      setPendingItems(items);
      setRawText(result.data.rawText);
      setPhase('done');
      setTimeout(() => navigate(`/session/${sessionId ?? 'new'}/edit`), 1000);
    } catch {
      setPhase('error');
      addToast('OCR failed — enter items manually');
      setTimeout(() => navigate(`/session/${sessionId ?? 'new'}/edit`, { state: { manual: true } }), 1500);
    }
  }

  const messages = {
    uploading: 'Uploading receipt…',
    scanning: 'Reading line items…',
    done: 'Items extracted!',
    error: 'Falling back to manual entry…',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-600 to-brand-800 flex flex-col items-center justify-center px-6 text-white">
      <div className="text-center">
        <div className="text-6xl mb-6">
          {phase === 'done' ? '✅' : phase === 'error' ? '⚠️' : '📄'}
        </div>

        <h2 className="text-xl font-bold mb-2">
          {phase === 'done' ? 'Got it!' : 'Scanning Receipt'}
        </h2>
        <p className="text-orange-200 text-sm mb-8">{messages[phase]}</p>

        {phase !== 'done' && phase !== 'error' && (
          <div className="flex gap-1 justify-center mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}

        {rawText && (
          <div className="bg-white/10 rounded-xl p-4 text-left max-w-xs mx-auto max-h-40 overflow-y-auto">
            <p className="text-xs font-mono text-orange-100 whitespace-pre-line leading-relaxed">
              {rawText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
