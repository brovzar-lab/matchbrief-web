import { create } from 'zustand';
import { JournalEntry, PatternCard, UserProfile } from './types';
import { isDemoMode } from './config';
import { DEMO_JOURNALS, DEMO_PATTERNS, DEMO_USER } from '../demo/seed';

interface NightCapState {
  // Auth
  user: UserProfile | null;
  isDemo: boolean;

  // RevenueCat — set true on launch if entitlement active, persists until sign-out
  rcPremiumActive: boolean;

  // Journal
  journals: Record<string, JournalEntry>; // keyed by YYYY-MM-DD
  patterns: PatternCard[];

  // Recording flow
  pendingTranscript: string;
  pendingTags: string[];

  // Actions
  setUser: (user: UserProfile | null) => void;
  setRcPremiumActive: (active: boolean) => void;
  setJournals: (journals: Record<string, JournalEntry>) => void;
  upsertJournal: (entry: JournalEntry) => void;
  setPatterns: (patterns: PatternCard[]) => void;
  setPendingTranscript: (transcript: string, tags: string[]) => void;
  clearPending: () => void;
  signOut: () => void;
}

export const useStore = create<NightCapState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  isDemo: isDemoMode,
  rcPremiumActive: false,
  journals: isDemoMode
    ? Object.fromEntries(DEMO_JOURNALS.map((j) => [j.date, j]))
    : {},
  patterns: isDemoMode ? DEMO_PATTERNS : [],
  pendingTranscript: '',
  pendingTags: [],

  setUser: (user) => set({ user }),
  setRcPremiumActive: (active) => set({ rcPremiumActive: active }),
  setJournals: (journals) => set({ journals }),
  upsertJournal: (entry) =>
    set((s) => ({ journals: { ...s.journals, [entry.date]: entry } })),
  setPatterns: (patterns) => set({ patterns }),
  setPendingTranscript: (pendingTranscript, pendingTags) =>
    set({ pendingTranscript, pendingTags }),
  clearPending: () => set({ pendingTranscript: '', pendingTags: [] }),
  signOut: () =>
    set({
      user: isDemoMode ? DEMO_USER : null,
      rcPremiumActive: false,
      journals: isDemoMode
        ? Object.fromEntries(DEMO_JOURNALS.map((j) => [j.date, j]))
        : {},
      patterns: isDemoMode ? DEMO_PATTERNS : [],
    }),
}));

export function initAuthListener() {
  if (isDemoMode) return () => {};

  let detach: (() => void) | undefined;

  (async () => {
    const { getAuth: getAuthInstance, getFirestore: getDbInstance } = await import('./firebase');
    const [auth, db] = await Promise.all([getAuthInstance(), getDbInstance()]);
    if (!auth || !db) return;

    const { onAuthStateChanged } = await import('firebase/auth');
    const { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } =
      await import('firebase/firestore');

    detach = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        useStore.setState({ user: null, journals: {}, patterns: [] });
        return;
      }

      const { uid, displayName, email } = firebaseUser;
      const profileRef = doc(db, 'users', uid);
      const snap = await getDoc(profileRef);

      let profile: UserProfile;
      if (!snap.exists()) {
        const now = new Date().toISOString();
        profile = {
          uid,
          displayName: displayName ?? '',
          email: email ?? '',
          createdAt: now,
          trialStartDate: now,
          tier: 'free',
        };
        await setDoc(profileRef, profile);
      } else {
        profile = { uid, ...(snap.data() as Omit<UserProfile, 'uid'>) };
      }

      useStore.setState({ user: profile });

      const [journalsSnap, patternsSnap] = await Promise.all([
        getDocs(
          query(collection(db, 'users', uid, 'journals'), orderBy('createdAt', 'desc'), limit(30)),
        ),
        getDocs(
          query(
            collection(db, 'users', uid, 'patterns'),
            orderBy('generatedAt', 'desc'),
            limit(10),
          ),
        ),
      ]);

      const journals: Record<string, JournalEntry> = {};
      journalsSnap.forEach((d) => {
        const data = d.data() as JournalEntry;
        journals[data.date] = data;
      });

      const patterns: PatternCard[] = patternsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PatternCard, 'id'>),
      }));

      useStore.setState({ journals, patterns });
    });
  })();

  return () => {
    detach?.();
  };
}
