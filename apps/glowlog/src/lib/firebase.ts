import { isDemoMode } from './config';

let _app: import('firebase/app').FirebaseApp | null = null;

export async function getFirebaseApp() {
  if (isDemoMode) return null;
  if (_app) return _app;

  const { initializeApp, getApps } = await import('firebase/app');
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  _app = initializeApp({
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  });
  return _app;
}

export async function getAuth() {
  const app = await getFirebaseApp();
  if (!app) return null;
  const { getAuth: _getAuth } = await import('firebase/auth');
  return _getAuth(app);
}

export async function getFirestore() {
  const app = await getFirebaseApp();
  if (!app) return null;
  const { getFirestore: _getFirestore } = await import('firebase/firestore');
  return _getFirestore(app);
}

export async function getStorage() {
  const app = await getFirebaseApp();
  if (!app) return null;
  const { getStorage: _getStorage } = await import('firebase/storage');
  return _getStorage(app);
}

export async function getFunctions() {
  const app = await getFirebaseApp();
  if (!app) return null;
  const { getFunctions: _getFunctions } = await import('firebase/functions');
  return _getFunctions(app);
}
