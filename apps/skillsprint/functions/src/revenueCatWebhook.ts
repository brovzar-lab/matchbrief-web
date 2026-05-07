import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';

if (getApps().length === 0) {
  initializeApp();
}

const WEBHOOK_AUTH_HEADER = 'x-revenuecat-authorization';

const ACTIVE_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
]);

const INACTIVE_EVENTS = new Set([
  'EXPIRATION',
  'CANCELLATION',
]);

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
}

interface RevenueCatPayload {
  event: RevenueCatEvent;
}

// Receives RevenueCat purchase events, writes Firestore subscription doc,
// and sets Firebase custom claim so startSprint can verify premium instantly.
export const revenueCatWebhook = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (webhookSecret) {
    const authHeader = req.headers[WEBHOOK_AUTH_HEADER];
    if (authHeader !== webhookSecret) {
      res.status(401).send('Unauthorized');
      return;
    }
  }

  const payload = req.body as RevenueCatPayload;
  const { event } = payload;

  if (!event?.app_user_id || !event?.type) {
    res.status(400).send('Bad Request');
    return;
  }

  const uid = event.app_user_id;
  let isPremium: boolean | null = null;

  if (ACTIVE_EVENTS.has(event.type)) {
    isPremium = true;
  } else if (INACTIVE_EVENTS.has(event.type)) {
    isPremium = false;
  }

  // Unknown event type — acknowledge but take no action
  if (isPremium === null) {
    res.status(200).send('OK');
    return;
  }

  const db = getFirestore();
  const auth = getAuth();

  await Promise.all([
    // Firestore: readable by owner client to show premium badge
    db.doc(`users/${uid}/profile/subscription`).set({ premium: isPremium }, { merge: true }),
    // Custom claim: read by startSprint and client token refresh within ~5s
    auth.setCustomUserClaims(uid, { premium: isPremium }).catch((err: unknown) => {
      logger.error('revenueCatWebhook: setCustomUserClaims failed', { uid, err });
    }),
  ]);

  res.status(200).send('OK');
});
