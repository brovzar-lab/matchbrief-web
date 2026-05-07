import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';

if (getApps().length === 0) {
  initializeApp();
}

const SPRINT_LIMIT_FREE = 3;

// Server-side gate: called before a sprint starts, not client-enforced.
// Premium users (custom claim set by revenueCatWebhook) bypass the cap entirely.
export const startSprint = onCall(async (req) => {
  if (!req.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in');
  }

  const uid = req.auth.uid;
  const token = req.auth.token as Record<string, unknown>;
  const isPremium = token['premium'] === true;

  if (!isPremium) {
    const db = getFirestore();
    const userRef = db.doc(`users/${uid}`);
    const userSnap = await userRef.get();
    const data = userSnap.data();
    const monthlyCount =
      typeof data?.monthlySprintCount === 'number' ? data.monthlySprintCount : 0;

    if (monthlyCount >= SPRINT_LIMIT_FREE) {
      throw new HttpsError(
        'permission-denied',
        'Monthly sprint limit reached. Upgrade to Premium for unlimited sprints.',
      );
    }
  }

  return { ok: true };
});
