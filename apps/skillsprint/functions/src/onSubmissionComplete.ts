import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import type { Timestamp } from 'firebase-admin/firestore';
import {
  toUTCDateStr,
  computeStreakUpdate,
  computeXP,
  computeLevel,
  type StreakState,
} from './streakEngine';

// Triggers when scoreSubmission writes a completed submission document.
// Path matches submissions/{uid}/challenges/{challengeId} written by scoreSubmission.ts.
export const onSubmissionComplete = onDocumentCreated(
  'submissions/{uid}/challenges/{challengeId}',
  async (event) => {
    if (!event.data) return;

    const { uid, challengeId } = event.params;
    const db = getFirestore();
    const submissionData = event.data.data();

    const submittedAtTs = submissionData['submittedAt'] as Timestamp | undefined;
    const submittedAtISO = submittedAtTs
      ? submittedAtTs.toDate().toISOString()
      : new Date().toISOString();

    const challengeSnap = await db.collection('challenges').doc(challengeId).get();
    const difficulty =
      typeof challengeSnap.data()?.['difficulty'] === 'string'
        ? (challengeSnap.data()?.['difficulty'] as string)
        : 'easy';

    const today = toUTCDateStr(new Date());

    // Best-effort: get sprint startedAt for speed bonus (falls back to assignedAt).
    let startedAtISO: string | null = null;
    const sprintSnap = await db.doc(`sprints/${uid}/daily/${today}`).get();
    if (sprintSnap.exists) {
      const sprintData = sprintSnap.data() ?? {};
      const startTs = (sprintData['startedAt'] ?? sprintData['assignedAt']) as
        | Timestamp
        | undefined;
      if (startTs) startedAtISO = startTs.toDate().toISOString();
    }

    await db.runTransaction(async (txn) => {
      const userRef = db.doc(`users/${uid}`);
      const userSnap = await txn.get(userRef);
      const userData = userSnap.data() ?? {};

      const state: StreakState = {
        currentStreak:
          typeof userData['currentStreak'] === 'number' ? userData['currentStreak'] : 0,
        longestStreak:
          typeof userData['longestStreak'] === 'number' ? userData['longestStreak'] : 0,
        weeklySkipsRemaining:
          typeof userData['weeklySkipsRemaining'] === 'number'
            ? userData['weeklySkipsRemaining']
            : 1,
        lastCompletedDate:
          typeof userData['lastCompletedDate'] === 'string' ? userData['lastCompletedDate'] : '',
      };

      const streakResult = computeStreakUpdate(state, today);
      if (streakResult.wasNoOp) return;

      const xpResult = computeXP(
        difficulty,
        streakResult.currentStreak,
        startedAtISO,
        submittedAtISO,
      );

      const currentTotalXP =
        typeof userData['totalXP'] === 'number' ? userData['totalXP'] : 0;
      const newTotalXP = currentTotalXP + xpResult.xpEarned;

      txn.update(userRef, {
        currentStreak: streakResult.currentStreak,
        longestStreak: streakResult.longestStreak,
        weeklySkipsRemaining: streakResult.weeklySkipsRemaining,
        lastCompletedDate: streakResult.lastCompletedDate,
        totalXP: newTotalXP,
        level: computeLevel(newTotalXP),
      });
    });
  },
);
