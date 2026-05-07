import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  OAuthProvider,
  signInWithCredential,
  type User,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { TrackId } from './config';

export function listenToAuthState(callback: (user: User | null) => void): () => void {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

export async function signInWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not initialized');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not initialized');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  if (!auth) return;
  return firebaseSignOut(auth);
}

export async function signInWithApple() {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!auth) throw new Error('Firebase not initialized');
  const { identityToken } = credential;
  if (!identityToken) throw new Error('No identity token from Apple');
  const provider = new OAuthProvider('apple.com');
  const oauthCredential = provider.credential({ idToken: identityToken });
  return signInWithCredential(auth, oauthCredential);
}

export async function saveUserTrack(uid: string, track: TrackId) {
  if (!db) throw new Error('Firestore not initialized');
  await setDoc(
    doc(db, 'users', uid),
    { profile: { selectedTrack: track }, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export interface UserProfile {
  selectedTrack?: TrackId;
  isPremium?: boolean;
  streak?: number;
  xp?: number;
}

interface UserDoc {
  profile?: { selectedTrack?: TrackId };
  isPremium?: boolean;
  streak?: number;
  xp?: number;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data() as UserDoc;
  return {
    selectedTrack: data.profile?.selectedTrack,
    isPremium: data.isPremium,
    streak: data.streak,
    xp: data.xp,
  };
}
