import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { AppUser, Location, Worker, Shift, SwapRequest } from './types';
import {
  DEMO_USER,
  DEMO_LOCATIONS,
  DEMO_WORKERS,
  DEMO_SHIFTS,
  DEMO_SWAP_REQUESTS,
} from '../demo/seed';
import { isDemoMode } from './config';
import { auth, db } from './firebase';

interface AppState {
  user: AppUser | null;
  isAuthLoading: boolean;
  currentLocation: Location | null;
  workers: Worker[];
  shifts: Shift[];
  swapRequests: SwapRequest[];

  setUser: (user: AppUser | null) => void;
  setAuthLoading: (v: boolean) => void;
  setCurrentLocation: (loc: Location | null) => void;
  setWorkers: (workers: Worker[]) => void;
  setShifts: (shifts: Shift[]) => void;
  setSwapRequests: (reqs: SwapRequest[]) => void;
  addSwapRequest: (req: SwapRequest) => void;
  updateSwapRequest: (id: string, patch: Partial<SwapRequest>) => void;
}

export const useStore = create<AppState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  isAuthLoading: !isDemoMode,
  currentLocation: isDemoMode ? DEMO_LOCATIONS[0] : null,
  workers: isDemoMode ? DEMO_WORKERS : [],
  shifts: isDemoMode ? DEMO_SHIFTS : [],
  swapRequests: isDemoMode ? DEMO_SWAP_REQUESTS : [],

  setUser: (user) => set({ user }),
  setAuthLoading: (v) => set({ isAuthLoading: v }),
  setCurrentLocation: (loc) => set({ currentLocation: loc }),
  setWorkers: (workers) => set({ workers }),
  setShifts: (shifts) => set({ shifts }),
  setSwapRequests: (reqs) => set({ swapRequests: reqs }),
  addSwapRequest: (req) => set((s) => ({ swapRequests: [req, ...s.swapRequests] })),
  updateSwapRequest: (id, patch) =>
    set((s) => ({
      swapRequests: s.swapRequests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
}));

export function initAuthListener(): () => void {
  if (isDemoMode || !auth || !db) return () => {};

  return onAuthStateChanged(auth, async (firebaseUser) => {
    const { setUser, setAuthLoading } = useStore.getState();

    if (firebaseUser) {
      const userDoc = await getDoc(doc(db!, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: data['name'] as string ?? '',
          companyId: data['companyId'] as string ?? '',
          locationId: data['locationId'] as string ?? '',
          role: (data['role'] as 'manager' | 'worker') ?? 'worker',
          fcmToken: data['fcmToken'] as string | undefined,
        });
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setAuthLoading(false);
  });
}
