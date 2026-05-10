import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { isDemoMode } from './demo';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// In demo mode Firebase is not initialized — callers must check isDemoMode first.
export const app = isDemoMode ? null : initializeApp(firebaseConfig);
export const auth = isDemoMode ? null : getAuth(app!);
export const db = isDemoMode ? null : getFirestore(app!);
export const storage = isDemoMode ? null : getStorage(app!);
export const functions = isDemoMode ? null : getFunctions(app!);

if (!isDemoMode && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth!, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db!, 'localhost', 8080);
  connectStorageEmulator(storage!, 'localhost', 9199);
  connectFunctionsEmulator(functions!, 'localhost', 5001);
}
