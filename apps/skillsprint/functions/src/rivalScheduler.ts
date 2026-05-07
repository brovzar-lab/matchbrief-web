import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const BATCH_SIZE = 450;

// Returns the YYYY-MM-DD of the Monday on or before the given UTC date.
function getMondayUTC(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function difficultyForLevel(level: number): string {
  if (level <= 3) return 'easy';
  if (level <= 7) return 'medium';
  return 'hard';
}

// Every Monday 00:00 UTC: reset skip tokens + create rival matchups for the week.
export const weeklyReset = onSchedule('0 0 * * 1', async () => {
  const db = getFirestore();
  const weekStart = getMondayUTC(new Date());

  const usersSnap = await db.collection('users').get();
  const userDocs = usersSnap.docs;

  // Batch-reset weeklySkipsRemaining for every user.
  for (let i = 0; i < userDocs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    userDocs.slice(i, i + BATCH_SIZE).forEach((doc) => {
      batch.update(doc.ref, { weeklySkipsRemaining: 1 });
    });
    await batch.commit();
  }

  // Skip users already paired this week (idempotent re-run safety).
  const existingSnap = await db
    .collection('rivals')
    .where('weekStart', '==', weekStart)
    .get();
  const pairedUids = new Set<string>();
  existingSnap.docs.forEach((doc) => {
    const d = doc.data();
    pairedUids.add(d['userA'] as string);
    if (d['userB'] !== 'practice') pairedUids.add(d['userB'] as string);
  });

  const unpaired = userDocs
    .filter((u) => !pairedUids.has(u.id))
    .map((u) => ({
      uid: u.id,
      level: typeof u.data()['level'] === 'number' ? (u.data()['level'] as number) : 1,
    }))
    .sort((a, b) => a.level - b.level);

  // Greedily pair neighbours within ±1 level; remainder gets a practice matchup.
  const pairs: Array<{ userA: string; userB: string; avgLevel: number }> = [];
  const seen = new Set<string>();

  for (let i = 0; i < unpaired.length; i++) {
    if (seen.has(unpaired[i].uid)) continue;

    let matched = false;
    for (let j = i + 1; j < unpaired.length; j++) {
      if (seen.has(unpaired[j].uid)) continue;
      if (Math.abs(unpaired[j].level - unpaired[i].level) <= 1) {
        pairs.push({
          userA: unpaired[i].uid,
          userB: unpaired[j].uid,
          avgLevel: Math.round((unpaired[i].level + unpaired[j].level) / 2),
        });
        seen.add(unpaired[i].uid);
        seen.add(unpaired[j].uid);
        matched = true;
        break;
      }
    }

    if (!matched) {
      pairs.push({ userA: unpaired[i].uid, userB: 'practice', avgLevel: unpaired[i].level });
      seen.add(unpaired[i].uid);
    }
  }

  if (pairs.length === 0) return;

  // Pre-fetch one challenge per difficulty tier used.
  const challengeByDifficulty = new Map<string, string>();
  const tiers = [...new Set(pairs.map((p) => difficultyForLevel(p.avgLevel)))];
  await Promise.all(
    tiers.map(async (difficulty) => {
      const snap = await db
        .collection('challenges')
        .where('difficulty', '==', difficulty)
        .limit(1)
        .get();
      challengeByDifficulty.set(difficulty, snap.docs[0]?.id ?? 'default');
    }),
  );

  // Batch write rival documents.
  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    pairs.slice(i, i + BATCH_SIZE).forEach((pair) => {
      const difficulty = difficultyForLevel(pair.avgLevel);
      batch.set(db.collection('rivals').doc(), {
        weekStart,
        userA: pair.userA,
        userB: pair.userB,
        challengeId: challengeByDifficulty.get(difficulty) ?? 'default',
        scoreA: 0,
        scoreB: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    });
    await batch.commit();
  }
});

// Every Sunday 23:59 UTC: finalise rival matchups and award bonus XP.
export const rivalFinalize = onSchedule('59 23 * * 0', async () => {
  const db = getFirestore();
  const weekStart = getMondayUTC(new Date());

  const rivalsSnap = await db
    .collection('rivals')
    .where('status', '==', 'active')
    .where('weekStart', '==', weekStart)
    .get();

  if (rivalsSnap.empty) return;

  for (let i = 0; i < rivalsSnap.docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const xpUpdates: Array<{ uid: string; xp: number }> = [];

    rivalsSnap.docs.slice(i, i + BATCH_SIZE).forEach((doc) => {
      const d = doc.data();
      const scoreA = typeof d['scoreA'] === 'number' ? d['scoreA'] : 0;
      const scoreB = typeof d['scoreB'] === 'number' ? d['scoreB'] : 0;
      const isPractice = d['userB'] === 'practice';

      let winner: 'userA' | 'userB' | 'tie';
      if (scoreA > scoreB) winner = 'userA';
      else if (scoreB > scoreA) winner = 'userB';
      else winner = 'tie';

      batch.update(doc.ref, { status: 'complete', winner });

      const userA = typeof d['userA'] === 'string' ? d['userA'] : '';
      const userB = typeof d['userB'] === 'string' ? d['userB'] : '';

      if (isPractice) {
        if (winner === 'userA') xpUpdates.push({ uid: userA, xp: 15 });
      } else if (winner === 'tie') {
        xpUpdates.push({ uid: userA, xp: 8 });
        xpUpdates.push({ uid: userB, xp: 8 });
      } else {
        xpUpdates.push({ uid: winner === 'userA' ? userA : userB, xp: 15 });
      }
    });

    await batch.commit();

    for (let j = 0; j < xpUpdates.length; j += BATCH_SIZE) {
      const xpBatch = db.batch();
      xpUpdates.slice(j, j + BATCH_SIZE).forEach(({ uid, xp }) => {
        xpBatch.update(db.doc(`users/${uid}`), { totalXP: FieldValue.increment(xp) });
      });
      await xpBatch.commit();
    }
  }
});

// Every Sunday 23:59 UTC: snapshot top-100 users by XP into leaderboardSnapshots.
export const weeklyLeaderboardSnapshot = onSchedule('59 23 * * 0', async () => {
  const db = getFirestore();
  const weekStart = getMondayUTC(new Date());

  const usersSnap = await db.collection('users').orderBy('totalXP', 'desc').limit(100).get();

  const entries = usersSnap.docs.map((doc, i) => ({
    rank: i + 1,
    uid: doc.id,
    totalXP: typeof doc.data()['totalXP'] === 'number' ? doc.data()['totalXP'] : 0,
    level: typeof doc.data()['level'] === 'number' ? doc.data()['level'] : 1,
    displayName: typeof doc.data()['displayName'] === 'string' ? doc.data()['displayName'] : null,
  }));

  await db.doc(`leaderboardSnapshots/${weekStart}`).set({
    weekStart,
    entries,
    createdAt: new Date().toISOString(),
  });
});
