import { create } from 'zustand';
import { UserProfile, Session, OnboardingAnswer } from './types';
import { isDemoMode } from './config';
import { DEMO_USER, DEMO_SESSIONS } from '../demo/seed';

interface MicroMentorState {
  user: UserProfile | null;
  isDemo: boolean;
  rcPremiumActive: boolean;

  sessions: Session[];
  activeSession: Session | null;

  // Onboarding flow
  onboardingAnswers: OnboardingAnswer[];
  onboardingStep: number;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setRcPremiumActive: (active: boolean) => void;
  setSessions: (sessions: Session[]) => void;
  prependSession: (session: Session) => void;
  setActiveSession: (session: Session | null) => void;
  updateActiveSessionStep: (stepIndex: number, response: string) => void;
  setOnboardingAnswer: (key: string, answer: string) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  signOut: () => void;
}

export const useStore = create<MicroMentorState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  isDemo: isDemoMode,
  rcPremiumActive: false,

  sessions: isDemoMode ? DEMO_SESSIONS : [],
  activeSession: null,

  onboardingAnswers: [],
  onboardingStep: 0,

  setUser: (user) => set({ user }),
  setRcPremiumActive: (active) => set({ rcPremiumActive: active }),
  setSessions: (sessions) => set({ sessions }),
  prependSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),
  setActiveSession: (activeSession) => set({ activeSession }),
  updateActiveSessionStep: (_stepIndex, _response) => {
    // Responses are captured locally in the screen; this is a hook point for persistence
  },
  setOnboardingAnswer: (key, answer) =>
    set((s) => {
      const existing = s.onboardingAnswers.findIndex((a) => a.questionKey === key);
      if (existing >= 0) {
        const updated = [...s.onboardingAnswers];
        updated[existing] = { questionKey: key, answer };
        return { onboardingAnswers: updated };
      }
      return { onboardingAnswers: [...s.onboardingAnswers, { questionKey: key, answer }] };
    }),
  setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
  completeOnboarding: () =>
    set((s) => ({
      user: s.user ? { ...s.user, onboardingComplete: true } : null,
    })),
  signOut: () =>
    set({
      user: isDemoMode ? DEMO_USER : null,
      rcPremiumActive: false,
      sessions: isDemoMode ? DEMO_SESSIONS : [],
      activeSession: null,
      onboardingAnswers: [],
      onboardingStep: 0,
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
    const { doc, getDoc, collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');

    detach = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        useStore.setState({ user: null });
        return;
      }

      const { uid, email, displayName } = firebaseUser;
      const profileRef = doc(db, 'users', uid, 'profile', 'data');
      const snap = await getDoc(profileRef);

      let profile: UserProfile;
      if (!snap.exists()) {
        const now = new Date().toISOString();
        profile = {
          uid,
          displayName: displayName ?? (email ? email.split('@')[0] : 'Coach Student'),
          email: email ?? null,
          createdAt: now,
          currentStreak: 0,
          lastSessionDate: null,
          dimensions: {
            leadership: 5,
            communication: 5,
            strategy: 5,
            execution: 5,
            influence: 5,
            selfAwareness: 5,
          },
          onboardingComplete: false,
          isPremium: false,
        };
        const { setDoc } = await import('firebase/firestore');
        await setDoc(profileRef, profile);
      } else {
        profile = { uid, ...(snap.data() as Omit<UserProfile, 'uid'>) };
      }

      useStore.setState({ user: profile });

      const sessionsSnap = await getDocs(
        query(collection(db, 'users', uid, 'sessions'), orderBy('date', 'desc'), limit(20)),
      );

      const sessions: Session[] = sessionsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Session, 'id'>),
      }));

      useStore.setState({ sessions });
    });
  })();

  return () => {
    detach?.();
  };
}
