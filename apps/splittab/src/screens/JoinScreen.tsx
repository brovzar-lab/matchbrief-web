import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isDemoMode } from '../lib/demo';
import { useAppStore } from '../lib/store';
import { DEMO_ITEMS, DEMO_SESSION } from '../lib/mockData';

export default function JoinScreen(): JSX.Element {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [venmoHandle, setVenmoHandle] = useState('');
  const [joining, setJoining] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const setGuestParticipantId = useAppStore((s) => s.setGuestParticipantId);
  const setItems = useAppStore((s) => s.setItems);
  const setSession = useAppStore((s) => s.setSession);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    if (isDemoMode) {
      setSessionName('The Rustic Table');
      setSession(DEMO_SESSION);
      setItems(DEMO_ITEMS);
      return;
    }
    if (!sessionId) return;

    void (async () => {
      const { db } = await import('../lib/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      if (!db) return;
      const snap = await getDoc(doc(db, 'sessions', sessionId));
      if (snap.exists()) {
        setSessionName(`Session ${sessionId}`);
      }
    })();
  }, [sessionId, setSession, setItems]);

  async function handleJoin(): Promise<void> {
    if (!name.trim()) return;
    setJoining(true);

    if (isDemoMode) {
      const demoId = `demo-p-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      setGuestParticipantId(demoId);
      addToast('Demo mode — not saved');
      navigate(`/join/${sessionId}/claim`);
      return;
    }

    try {
      const { auth, db } = await import('../lib/firebase');
      const { signInAnonymously } = await import('firebase/auth');
      const { doc, setDoc, collection, serverTimestamp } = await import('firebase/firestore');

      if (!auth || !db) return;

      const cred = await signInAnonymously(auth);
      const uid = cred.user.uid;

      await setDoc(doc(collection(db, 'sessions', sessionId!, 'participants'), uid), {
        name: name.trim(),
        venmoHandle: venmoHandle.trim() || null,
        joinedAt: serverTimestamp(),
        total: 0,
        paymentLink: '',
      });

      setGuestParticipantId(uid);
      navigate(`/join/${sessionId}/claim`);
    } catch {
      addToast('Failed to join. Please try again.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧾</div>
          <h1 className="text-2xl font-bold text-gray-900">Join the Split</h1>
          {sessionName && (
            <p className="text-gray-500 text-sm mt-1">{sessionName}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Enter your name"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && void handleJoin()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venmo handle{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
              <span className="bg-gray-50 px-3 py-3 text-gray-400 text-sm border-r border-gray-300">
                @
              </span>
              <input
                type="text"
                value={venmoHandle}
                onChange={(e) => setVenmoHandle(e.target.value.replace('@', ''))}
                className="flex-1 px-3 py-3 text-sm focus:outline-none"
                placeholder="your-venmo"
              />
            </div>
          </div>

          <button
            onClick={() => void handleJoin()}
            disabled={joining || !name.trim()}
            className="w-full bg-brand-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {joining ? 'Joining…' : 'Join & Claim Items →'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          No account needed · Zero install
        </p>
      </div>
    </div>
  );
}
