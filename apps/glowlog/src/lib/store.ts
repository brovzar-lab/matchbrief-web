import { create } from 'zustand';
import {
  UserProfile,
  Product,
  Routine,
  RoutineEntry,
  SkinCheck,
  ProductRating,
  ProductEfficacy,
  RoutineType,
} from './types';
import { isDemoMode } from './config';
import {
  DEMO_USER,
  DEMO_PRODUCTS,
  DEMO_MORNING_ROUTINE,
  DEMO_NIGHT_ROUTINE,
  DEMO_ROUTINE_ENTRIES,
  DEMO_SKIN_CHECKS,
  DEMO_RATINGS,
  DEMO_EFFICACY,
} from '../demo/seed';

interface GlowLogState {
  user: UserProfile | null;
  isDemo: boolean;
  rcPremiumActive: boolean;

  products: Product[];
  morningRoutine: Routine | null;
  nightRoutine: Routine | null;
  routineEntries: RoutineEntry[];
  skinChecks: SkinCheck[];
  ratings: ProductRating[];
  efficacy: Record<string, ProductEfficacy>;

  activeRoutineType: RoutineType;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setRcPremiumActive: (active: boolean) => void;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  setRoutine: (routine: Routine) => void;
  addRoutineEntry: (entry: RoutineEntry) => void;
  setSkinChecks: (checks: SkinCheck[]) => void;
  addSkinCheck: (check: SkinCheck) => void;
  addRating: (rating: ProductRating) => void;
  setEfficacy: (productId: string, efficacy: ProductEfficacy) => void;
  setActiveRoutineType: (type: RoutineType) => void;
  signOut: () => void;
}

export const useStore = create<GlowLogState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  isDemo: isDemoMode,
  rcPremiumActive: false,

  products: isDemoMode ? DEMO_PRODUCTS : [],
  morningRoutine: isDemoMode ? DEMO_MORNING_ROUTINE : null,
  nightRoutine: isDemoMode ? DEMO_NIGHT_ROUTINE : null,
  routineEntries: isDemoMode ? DEMO_ROUTINE_ENTRIES : [],
  skinChecks: isDemoMode ? DEMO_SKIN_CHECKS : [],
  ratings: isDemoMode ? DEMO_RATINGS : [],
  efficacy: isDemoMode ? DEMO_EFFICACY : {},

  activeRoutineType: 'morning',

  setUser: (user) => set({ user }),
  setRcPremiumActive: (active) => set({ rcPremiumActive: active }),
  setProducts: (products) => set({ products }),
  addProduct: (product) =>
    set((s) => ({ products: [...s.products, product] })),
  setRoutine: (routine) =>
    set(routine.type === 'morning'
      ? { morningRoutine: routine }
      : { nightRoutine: routine }),
  addRoutineEntry: (entry) =>
    set((s) => ({ routineEntries: [entry, ...s.routineEntries] })),
  setSkinChecks: (skinChecks) => set({ skinChecks }),
  addSkinCheck: (check) =>
    set((s) => ({ skinChecks: [check, ...s.skinChecks] })),
  addRating: (rating) =>
    set((s) => ({ ratings: [rating, ...s.ratings] })),
  setEfficacy: (productId, efficacy) =>
    set((s) => ({ efficacy: { ...s.efficacy, [productId]: efficacy } })),
  setActiveRoutineType: (activeRoutineType) => set({ activeRoutineType }),
  signOut: () =>
    set({
      user: isDemoMode ? DEMO_USER : null,
      rcPremiumActive: false,
      products: isDemoMode ? DEMO_PRODUCTS : [],
      morningRoutine: isDemoMode ? DEMO_MORNING_ROUTINE : null,
      nightRoutine: isDemoMode ? DEMO_NIGHT_ROUTINE : null,
      routineEntries: isDemoMode ? DEMO_ROUTINE_ENTRIES : [],
      skinChecks: isDemoMode ? DEMO_SKIN_CHECKS : [],
      ratings: isDemoMode ? DEMO_RATINGS : [],
      efficacy: isDemoMode ? DEMO_EFFICACY : {},
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
    const { doc, getDoc, collection, query, orderBy, limit, getDocs, setDoc } = await import(
      'firebase/firestore'
    );

    detach = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        useStore.setState({
          user: null,
          products: [],
          morningRoutine: null,
          nightRoutine: null,
          routineEntries: [],
          skinChecks: [],
          ratings: [],
          efficacy: {},
        });
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
          displayName: displayName ?? (email ? email.split('@')[0] : 'Glow User'),
          email: email ?? null,
          createdAt: now,
          streakDays: 0,
          lastCheckInDate: null,
          isPremium: false,
        };
        await setDoc(profileRef, profile);
      } else {
        profile = { uid, ...(snap.data() as Omit<UserProfile, 'uid'>) };
      }

      useStore.setState({ user: profile });

      // Load products
      const productsSnap = await getDocs(
        collection(db, 'users', uid, 'products'),
      );
      const products = productsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      useStore.setState({ products });

      // Load routines
      const routinesSnap = await getDocs(collection(db, 'users', uid, 'routines'));
      for (const d of routinesSnap.docs) {
        const routine = { id: d.id, ...(d.data() as any) };
        useStore.setState(
          routine.type === 'morning'
            ? { morningRoutine: routine }
            : { nightRoutine: routine },
        );
      }

      // Load recent routine entries
      const entriesSnap = await getDocs(
        query(
          collection(db, 'users', uid, 'routineEntries'),
          orderBy('loggedAt', 'desc'),
          limit(28),
        ),
      );
      const routineEntries = entriesSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      useStore.setState({ routineEntries });

      // Load skin checks
      const skinChecksSnap = await getDocs(
        query(collection(db, 'users', uid, 'skinChecks'), orderBy('date', 'desc'), limit(20)),
      );
      const skinChecks = skinChecksSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      useStore.setState({ skinChecks });

      // Load ratings
      const ratingsSnap = await getDocs(
        query(collection(db, 'users', uid, 'productRatings'), orderBy('ratedAt', 'desc'), limit(50)),
      );
      const ratings = ratingsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      useStore.setState({ ratings });
    });
  })();

  return () => {
    detach?.();
  };
}
