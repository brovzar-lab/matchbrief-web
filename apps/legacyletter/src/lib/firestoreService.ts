import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  Timestamp,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { isDemoMode } from './config';
import type { Legacy, UserSubscription } from './types';

function legaciesCol(uid: string) {
  return collection(db!, `users/${uid}/legacies`);
}

function legacyDocRef(uid: string, legacyId: string) {
  return doc(db!, `users/${uid}/legacies/${legacyId}`);
}

function fromFirestore(id: string, data: Record<string, unknown>): Legacy {
  return {
    id,
    type: data.type as Legacy['type'],
    title: (data.title as string) ?? '',
    content: (data.content as string) ?? '',
    storageRef: data.storageRef as string | undefined,
    deliveryDate:
      data.deliveryDate instanceof Timestamp ? data.deliveryDate.toDate() : null,
    recipients: (data.recipients as Legacy['recipients']) ?? [],
    status: (data.status as Legacy['status']) ?? 'draft',
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    durationSeconds: data.durationSeconds as number | undefined,
  };
}

export async function createTextLegacy(
  uid: string,
  payload: { title: string; content: string }
): Promise<Legacy> {
  if (isDemoMode) throw new Error('createTextLegacy: unavailable in demo mode');
  const ref = await addDoc(legaciesCol(uid), {
    type: 'text',
    title: payload.title,
    content: payload.content,
    deliveryDate: null,
    recipients: [],
    status: 'draft',
    createdAt: serverTimestamp(),
  });
  return {
    id: ref.id,
    type: 'text',
    title: payload.title,
    content: payload.content,
    deliveryDate: null,
    recipients: [],
    status: 'draft',
    createdAt: new Date(),
  };
}

export async function updateLegacy(
  uid: string,
  legacyId: string,
  patch: Partial<Omit<Legacy, 'id' | 'type' | 'createdAt'>>
): Promise<void> {
  if (isDemoMode) throw new Error('updateLegacy: unavailable in demo mode');
  await updateDoc(legacyDocRef(uid, legacyId), patch as Record<string, unknown>);
}

export async function deleteLegacy(uid: string, legacyId: string): Promise<void> {
  if (isDemoMode) throw new Error('deleteLegacy: unavailable in demo mode');
  await deleteDoc(legacyDocRef(uid, legacyId));
}

export function subscribeLegacies(
  uid: string,
  onUpdate: (legacies: Legacy[]) => void
): Unsubscribe {
  if (isDemoMode) return () => {};
  return onSnapshot(legaciesCol(uid), (snap) => {
    const legacies = snap.docs.map((d) => fromFirestore(d.id, d.data()));
    legacies.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    onUpdate(legacies);
  });
}

export async function createVoiceLegacy(
  uid: string,
  payload: { title: string; storageRef: string; durationSeconds: number }
): Promise<Legacy> {
  if (isDemoMode) throw new Error('createVoiceLegacy: unavailable in demo mode');
  const docRef = await addDoc(legaciesCol(uid), {
    type: 'voice',
    title: payload.title,
    content: '',
    storageRef: payload.storageRef,
    durationSeconds: payload.durationSeconds,
    deliveryDate: null,
    recipients: [],
    status: 'draft',
    createdAt: serverTimestamp(),
  });
  return {
    id: docRef.id,
    type: 'voice',
    title: payload.title,
    content: '',
    storageRef: payload.storageRef,
    durationSeconds: payload.durationSeconds,
    deliveryDate: null,
    recipients: [],
    status: 'draft',
    createdAt: new Date(),
  };
}

export async function fetchUserSubscription(uid: string): Promise<UserSubscription> {
  if (isDemoMode) throw new Error('fetchUserSubscription: unavailable in demo mode');
  const snap = await getDoc(doc(db!, `users/${uid}`));
  if (!snap.exists()) return { tier: 'free', expiresAt: null, revenueCatId: null };
  const data = snap.data();
  const sub = data.subscription as Record<string, unknown> | undefined;
  return {
    tier: (sub?.tier as UserSubscription['tier']) ?? 'free',
    expiresAt:
      sub?.expiresAt instanceof Timestamp ? sub.expiresAt.toDate() : null,
    revenueCatId: (sub?.revenueCatId as string | null) ?? null,
  };
}
