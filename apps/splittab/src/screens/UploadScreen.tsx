import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';
import { DEMO_OCR_ITEMS, DEMO_SESSION } from '../lib/mockData';
import { generateSessionId } from '../lib/utils';

export default function UploadScreen(): JSX.Element {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const setSession = useAppStore((s) => s.setSession);
  const setItems = useAppStore((s) => s.setItems);
  const addToast = useAppStore((s) => s.addToast);
  const user = useAppStore((s) => s.user);

  function handleDemoReceipt(): void {
    setSession({ ...DEMO_SESSION, status: 'scanning' });
    setItems(DEMO_OCR_ITEMS);
    navigate(`/session/${DEMO_SESSION.id}/scan`);
  }

  async function handleFile(file: File): Promise<void> {
    if (!user || isDemoMode) return;
    setUploading(true);
    try {
      const sessionId = generateSessionId();
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const { db, auth } = await import('../lib/firebase');
        const { collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        if (!db || !auth?.currentUser) return;

        await setDoc(doc(collection(db, 'sessions'), sessionId), {
          hostId: auth.currentUser.uid,
          status: 'scanning',
          receiptImageUrl: '',
          subtotal: 0,
          tax: 0,
          tip: 0,
          createdAt: serverTimestamp(),
        });

        setSession({
          id: sessionId,
          hostId: auth.currentUser.uid,
          status: 'scanning',
          receiptImageUrl: '',
          subtotal: 0,
          tax: 0,
          tip: 0,
          createdAt: new Date(),
        });

        navigate(`/session/${sessionId}/scan`, { state: { imageBase64: base64, sessionId } });
      };
      reader.readAsDataURL(file);
    } catch {
      addToast('Failed to upload receipt. Please try again.');
      setUploading(false);
    }
  }

  async function handleCamera(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach((t) => t.stop());
      fileInputRef.current?.click();
    } catch {
      fileInputRef.current?.click();
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🧾</div>
          <h1 className="text-2xl font-bold text-gray-900">SplitTab</h1>
          <p className="text-gray-500 mt-1 text-sm">Scan your receipt to get started</p>
        </div>

        <div className="space-y-3">
          {isDemoMode ? (
            <button
              onClick={handleDemoReceipt}
              className="w-full bg-brand-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">🍕</span>
              Try Demo Receipt
            </button>
          ) : (
            <>
              <button
                onClick={handleCamera}
                disabled={uploading}
                className="w-full bg-brand-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">📷</span>
                Take Photo
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-brand-600 text-brand-600 rounded-xl py-4 font-semibold text-base hover:bg-orange-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">📁</span>
                Choose from Library
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
            </>
          )}
        </div>

        {uploading && (
          <p className="text-center text-sm text-gray-500 mt-4 animate-pulse">
            Uploading receipt…
          </p>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Works on iOS Safari 16.4+ · No app install needed for guests
        </p>
      </div>
    </div>
  );
}
