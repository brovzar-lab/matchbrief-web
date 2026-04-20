import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { BabyEvent, SleepEvent } from './types';

type FirestoreData = Record<string, unknown>;

function toFirestore(event: BabyEvent): FirestoreData {
  const base: FirestoreData = {
    ...event,
    timestamp: Timestamp.fromDate(event.timestamp),
  };
  if (event.type === 'sleep') {
    base.startTime = Timestamp.fromDate(event.startTime);
    base.endTime = event.endTime ? Timestamp.fromDate(event.endTime) : null;
  }
  return base;
}

function fromFirestore(data: FirestoreData): BabyEvent {
  const base = {
    ...data,
    timestamp: (data.timestamp as Timestamp).toDate(),
  };
  if (data.type === 'sleep') {
    (base as Partial<SleepEvent>).startTime = (data.startTime as Timestamp).toDate();
    (base as Partial<SleepEvent>).endTime = data.endTime
      ? (data.endTime as Timestamp).toDate()
      : undefined;
  }
  return base as BabyEvent;
}

export async function saveEvent(uid: string, babyId: string, event: BabyEvent): Promise<void> {
  if (!db) return;
  const ref = doc(db, `users/${uid}/babies/${babyId}/events`, event.id);
  await setDoc(ref, toFirestore(event));
}

export async function fetchRecentEvents(
  uid: string,
  babyId: string,
  limitCount: number,
): Promise<BabyEvent[]> {
  if (!db) return [];
  const q = query(
    collection(db, `users/${uid}/babies/${babyId}/events`),
    orderBy('timestamp', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore(d.data() as FirestoreData));
}
