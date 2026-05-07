import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDemoMode } from './config';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = isDemoMode ? null : initializeApp(firebaseConfig);

export const auth = isDemoMode
  ? null
  : initializeAuth(app!, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

export const db = isDemoMode ? null : getFirestore(app!);

export const storage = isDemoMode ? null : getStorage(app!);

if (!isDemoMode && process.env.EXPO_PUBLIC_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth!, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db!, 'localhost', 8080);
  connectStorageEmulator(storage!, 'localhost', 9199);
}
