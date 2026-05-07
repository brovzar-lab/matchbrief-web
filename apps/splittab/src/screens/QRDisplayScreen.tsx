import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';
import { DEMO_PARTICIPANTS } from '../lib/mockData';

export default function QRDisplayScreen(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const participants = useAppStore((s) => s.participants);
  const setParticipants = useAppStore((s) => s.setParticipants);

  const joinUrl = `${window.location.origin}/join/${id}`;

  useEffect(() => {
    void QRCode.toDataURL(joinUrl, { width: 240, margin: 2, color: { dark: '#1a1a1a' } }).then(
      setQrDataUrl,
    );
  }, [joinUrl]);

  useEffect(() => {
    if (!id || isDemoMode) {
      if (isDemoMode) setParticipants(DEMO_PARTICIPANTS);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    void (async () => {
      const { db } = await import('../lib/firebase');
      const { collection, onSnapshot } = await import('firebase/firestore');
      if (!db) return;

      unsubscribe = onSnapshot(collection(db, 'sessions', id, 'participants'), (snap) => {
        setParticipants(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name as string,
            joinedAt: (d.data().joinedAt as { toDate: () => Date })?.toDate() ?? new Date(),
            venmoHandle: (d.data().venmoHandle as string | null) ?? null,
            total: (d.data().total as number) ?? 0,
            paymentLink: (d.data().paymentLink as string) ?? '',
          })),
        );
      });
    })();

    return () => unsubscribe?.();
  }, [id, setParticipants]);

  async function copyLink(): Promise<void> {
    await navigator.clipboard.writeText(joinUrl);
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Share with Your Group</h1>
        <p className="text-sm text-gray-500 mt-1">Guests scan the QR or tap the link — no app needed</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-4">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="QR code to join" className="w-48 h-48 rounded-xl" />
        ) : (
          <div className="w-48 h-48 bg-gray-100 rounded-xl animate-pulse" />
        )}

        <div className="w-full bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2">
          <p className="flex-1 text-xs text-gray-600 truncate">{joinUrl}</p>
          <button
            onClick={() => void copyLink()}
            className="shrink-0 text-xs font-semibold text-brand-600 hover:underline"
          >
            Copy
          </button>
        </div>

        <div className="w-full border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Guests joined</span>
            <span className="text-lg font-bold text-brand-600">{participants.length}</span>
          </div>
          {participants.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {participants.map((p) => (
                <span
                  key={p.id}
                  className="bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {p.name}
                </span>
              ))}
            </div>
          )}
          {participants.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">Waiting for guests…</p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => navigate(`/session/${id}/claims`)}
          className="w-full bg-brand-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-brand-700 transition-colors"
        >
          View Live Claims →
        </button>
        <button
          onClick={() => navigate(`/session/${id}/summary`)}
          className="w-full border-2 border-gray-300 text-gray-600 rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Calculate Split
        </button>
      </div>
    </div>
  );
}
