import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import type { AppUser, Legacy, Recipient, UserSubscription } from './types';
import { DEMO_USER, DEMO_LEGACIES, DEMO_RECIPIENTS } from './mockData';
import { isDemoMode } from './config';
import { auth, db } from './firebase';

interface AppState {
  // Auth
  user: AppUser | null;
  isAuthLoading: boolean;
  // Legacies
  legacies: Legacy[];
  isLegaciesLoading: boolean;
  // Recipients (global address book)
  recipients: Recipient[];
  // Actions
  setUser: (user: AppUser | null) => void;
  setAuthLoading: (v: boolean) => void;
  updateSubscription: (subscription: UserSubscription) => void;
  setLegacies: (legacies: Legacy[]) => void;
  addLegacy: (legacy: Legacy) => void;
  updateLegacy: (id: string, patch: Partial<Legacy>) => void;
  deleteLegacy: (id: string) => void;
  setRecipients: (recipients: Recipient[]) => void;
  addRecipient: (recipient: Recipient) => void;
  removeRecipient: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  isAuthLoading: !isDemoMode,
  legacies: isDemoMode ? DEMO_LEGACIES : [],
  isLegaciesLoading: false,
  recipients: isDemoMode ? DEMO_RECIPIENTS : [],

  setUser: (user) => set({ user }),
  setAuthLoading: (v) => set({ isAuthLoading: v }),
  updateSubscription: (subscription) =>
    set((s) => s.user ? { user: { ...s.user, subscription } } : {}),
  setLegacies: (legacies) => set({ legacies }),
  addLegacy: (legacy) =>
    set((s) => ({ legacies: [legacy, ...s.legacies] })),
  updateLegacy: (id, patch) =>
    set((s) => ({
      legacies: s.legacies.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    })),
  deleteLegacy: (id) =>
    set((s) => ({ legacies: s.legacies.filter((l) => l.id !== id) })),
  setRecipients: (recipients) => set({ recipients }),
  addRecipient: (recipient) =>
    set((s) => ({ recipients: [...s.recipients, recipient] })),
  removeRecipient: (id) =>
    set((s) => ({ recipients: s.recipients.filter((r) => r.id !== id) })),
}));

export function initAuthListener(): () => void {
  if (isDemoMode || !auth || !db) return () => {};

  return onAuthStateChanged(auth, async (firebaseUser) => {
    const { setUser, setAuthLoading } = useStore.getState();

    if (firebaseUser) {
      let subscription: UserSubscription = { tier: 'free', expiresAt: null, revenueCatId: null };
      try {
        const snap = await getDoc(doc(db!, `users/${firebaseUser.uid}`));
        if (snap.exists()) {
          const data = snap.data();
          const sub = data.subscription as Record<string, unknown> | undefined;
          subscription = {
            tier: (sub?.tier as UserSubscription['tier']) ?? 'free',
            expiresAt:
              sub?.expiresAt instanceof Timestamp ? sub.expiresAt.toDate() : null,
            revenueCatId: (sub?.revenueCatId as string | null) ?? null,
          };
        }
      } catch {
        // user doc may not exist yet on first sign-up
      }

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        subscription,
      });
    } else {
      setUser(null);
    }

    setAuthLoading(false);
  });
}

export async function createUserDoc(
  uid: string,
  email: string,
  displayName: string | null
): Promise<void> {
  if (isDemoMode || !db) return;
  const ref = doc(db, `users/${uid}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      displayName,
      subscription: { tier: 'free', expiresAt: null, revenueCatId: null },
    });
  }
}
