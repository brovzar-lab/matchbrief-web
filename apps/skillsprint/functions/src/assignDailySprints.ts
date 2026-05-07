import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';
import type { Difficulty } from './types';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

const CHUNK_SIZE = 100;
const RECENT_DAYS = 30;

interface UserData {
  track?: string;
  level?: number;
  dayIndex?: number;
}

/**
 * Returns the target difficulty for a user based on their level and how many
 * sprint days they've completed (dayIndex). Every 5th day (dayIndex % 5 === 4)
 * bumps one tier for a stretch challenge.
 */
export function getDifficulty(level: number, dayIndex: number): Difficulty {
  const isStretchDay = dayIndex % 5 === 4;
  if (level <= 3) return isStretchDay ? 'medium' : 'easy';
  if (level <= 7) return isStretchDay ? 'hard' : 'medium';
  return 'hard'; // level 8+: already hardest band
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export const assignDailySprints = onSchedule('0 5 * * *', async () => {
  const today = todayUTC();
  const usersSnap = await db.collection('users').get();
  const users = usersSnap.docs;

  for (let i = 0; i < users.length; i += CHUNK_SIZE) {
    await Promise.all(
      users
        .slice(i, i + CHUNK_SIZE)
        .map((doc) => assignForUser(doc.id, doc.data() as UserData, today)),
    );
  }
});

async function assignForUser(uid: string, data: UserData, today: string): Promise<void> {
  const sprintRef = db.doc(`sprints/${uid}/daily/${today}`);
  const existing = await sprintRef.get();
  if (existing.exists) return; // idempotent: already assigned today

  const track = data.track ?? 'coding';
  const level = data.level ?? 1;
  const dayIndex = data.dayIndex ?? 0;
  const difficulty = getDifficulty(level, dayIndex);

  // Exclude challenges completed in the last 30 days
  const cutoff = Timestamp.fromDate(
    new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000),
  );
  const recentSnap = await db
    .collection('submissions')
    .doc(uid)
    .collection('records')
    .where('submittedAt', '>=', cutoff)
    .get();
  const recentIds = new Set(recentSnap.docs.map((d) => d.id));

  const challengesSnap = await db
    .collection('challenges')
    .where('track', '==', track)
    .where('difficulty', '==', difficulty)
    .limit(10)
    .get();

  const candidates = challengesSnap.docs.filter((d) => !recentIds.has(d.id));
  if (candidates.length === 0) return;

  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  await sprintRef.set({
    challengeId: selected.id,
    assignedAt: Timestamp.now(),
    status: 'pending',
  });
}
