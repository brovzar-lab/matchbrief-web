import { create } from 'zustand';
import { Memo, WeeklySummary, UserProfile, RecordingState } from './types';
import { isDemoMode } from './config';
import { DEMO_MEMOS, DEMO_USER, DEMO_WEEKLY_SUMMARY } from '../demo/seed';

interface MemoPodState {
  user: UserProfile | null;
  isDemo: boolean;
  rcPremiumActive: boolean;

  memos: Memo[];
  weeklySummary: WeeklySummary | null;

  // Recording flow
  recordingState: RecordingState;
  liveTranscript: string;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setRcPremiumActive: (active: boolean) => void;
  setMemos: (memos: Memo[]) => void;
  prependMemo: (memo: Memo) => void;
  removeMemo: (id: string) => void;
  updateMemoCategory: (id: string, category: Memo['category']) => void;
  setWeeklySummary: (summary: WeeklySummary) => void;
  setRecordingState: (state: RecordingState) => void;
  setLiveTranscript: (text: string) => void;
  signOut: () => void;
}

export const useStore = create<MemoPodState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  isDemo: isDemoMode,
  rcPremiumActive: false,

  memos: isDemoMode ? DEMO_MEMOS : [],
  weeklySummary: isDemoMode ? DEMO_WEEKLY_SUMMARY : null,

  recordingState: 'idle',
  liveTranscript: '',

  setUser: (user) => set({ user }),
  setRcPremiumActive: (active) => set({ rcPremiumActive: active }),
  setMemos: (memos) => set({ memos }),
  prependMemo: (memo) => set((s) => ({ memos: [memo, ...s.memos] })),
  removeMemo: (id) => set((s) => ({ memos: s.memos.filter((m) => m.id !== id) })),
  updateMemoCategory: (id, category) =>
    set((s) => ({
      memos: s.memos.map((m) => (m.id === id ? { ...m, category } : m)),
    })),
  setWeeklySummary: (weeklySummary) => set({ weeklySummary }),
  setRecordingState: (recordingState) => set({ recordingState }),
  setLiveTranscript: (liveTranscript) => set({ liveTranscript }),
  signOut: () =>
    set({
      user: isDemoMode ? DEMO_USER : null,
      rcPremiumActive: false,
      memos: isDemoMode ? DEMO_MEMOS : [],
      weeklySummary: isDemoMode ? DEMO_WEEKLY_SUMMARY : null,
    }),
}));

export function initAuthListener() {
  if (isDemoMode) return () => {};

  let detach: (() => void) | undefined;

  (async () => {
    const { getAuth: getAuthInstance, getFirestore: getDbInstance } = await import('./firebase');
    const [auth, db] = await Promise.all([getAuthInstance(), getDbInstance()]);
    if (!auth || !db) return;

    const { onAuthStateChanged, signInAnonymously } = await import('firebase/auth');
    const { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } =
      await import('firebase/firestore');

    detach = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // Auto sign in anonymously
        signInAnonymously(auth).catch(() => {});
        return;
      }

      const { uid, email } = firebaseUser;
      const profileRef = doc(db, 'users', uid, 'profile', 'data');
      const snap = await getDoc(profileRef);

      let profile: UserProfile;
      if (!snap.exists()) {
        const now = new Date().toISOString();
        profile = {
          uid,
          displayName: email ? email.split('@')[0] : 'Memo User',
          email: email ?? null,
          createdAt: now,
          memoCountThisMonth: 0,
          isPremium: false,
        };
        await setDoc(profileRef, profile);
      } else {
        profile = { uid, ...(snap.data() as Omit<UserProfile, 'uid'>) };
      }

      useStore.setState({ user: profile });

      const memosSnap = await getDocs(
        query(collection(db, 'users', uid, 'memos'), orderBy('createdAt', 'desc'), limit(50)),
      );

      const memos: Memo[] = memosSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Memo, 'id'>),
      }));

      useStore.setState({ memos });
    });
  })();

  return () => {
    detach?.();
  };
}
