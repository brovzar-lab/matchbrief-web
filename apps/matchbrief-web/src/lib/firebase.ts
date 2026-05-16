import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  getDoc,
  type Timestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useStore } from './store';
import type { Analysis, UserProfile } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
const fns = getFunctions(app, 'us-central1');

export const analyzeApplicationFn = httpsCallable<
  { jobDescription: string; resumeText: string },
  {
    analysisId: string;
    score: number;
    keywords: Array<{ word: string; status: 'green' | 'yellow' | 'red' }>;
    rewrittenBullets: Array<{ original: string; rewritten: string }>;
    coverLetters: [string, string, string];
  }
>(fns, 'analyzeApplication');

export const parseResumePdfFn = httpsCallable<
  { pdfBase64: string },
  { text: string | null; error?: string }
>(fns, 'parseResumePdf');

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email: string, password: string): Promise<void> {
  await createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
  useStore.getState().signOut();
}

function tsToIso(ts: Timestamp | null | undefined): string | null {
  if (!ts) return null;
  return ts.toDate().toISOString();
}

async function loadUserProfile(firebaseUser: User): Promise<UserProfile> {
  const profileRef = doc(db, 'users', firebaseUser.uid, 'profile', 'data');
  const snap = await getDoc(profileRef);
  if (snap.exists()) {
    return { uid: firebaseUser.uid, ...(snap.data() as Omit<UserProfile, 'uid'>) };
  }
  const now = new Date().toISOString();
  const resetAt = new Date();
  resetAt.setMonth(resetAt.getMonth() + 1);
  const profile: UserProfile = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User',
    email: firebaseUser.email,
    tier: 'free',
    analysisCount: 0,
    analysisResetAt: resetAt.toISOString(),
    createdAt: now,
  };
  await setDoc(profileRef, profile);
  return profile;
}

async function loadAnalyses(uid: string): Promise<Analysis[]> {
  const snap = await getDocs(
    query(
      collection(db, 'users', uid, 'analyses'),
      orderBy('createdAt', 'desc'),
      limit(20),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      jobDescription: data.jobDescription as string,
      resumeText: data.resumeText as string,
      score: data.score as number,
      keywords: data.keywords as Analysis['keywords'],
      rewrittenBullets: data.rewrittenBullets as Analysis['rewrittenBullets'],
      coverLetters: data.coverLetters as Analysis['coverLetters'],
      createdAt: tsToIso(data.createdAt as Timestamp | null) ?? new Date().toISOString(),
    };
  });
}

export function initFirebase(): () => void {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      useStore.setState({ user: null, analyses: [] });
      return;
    }

    const [profile, analyses] = await Promise.all([
      loadUserProfile(firebaseUser),
      loadAnalyses(firebaseUser.uid),
    ]);

    useStore.setState({ user: profile, analyses });
  });

  return unsubscribe;
}
