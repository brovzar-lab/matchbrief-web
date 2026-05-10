import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();

/**
 * joinHousehold — called by Parent 2 to link to an existing household via invite code.
 * Validates the code, ensures the household slot is open, writes parent2Uid.
 */
export const joinHousehold = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const inviteCode: unknown = data.inviteCode;
  if (typeof inviteCode !== 'string' || inviteCode.length !== 6) {
    throw new functions.https.HttpsError('invalid-argument', 'inviteCode must be 6 digits.');
  }

  const callerUid = context.auth.uid;

  // Find the household with this invite code
  const snap = await db
    .collection('households')
    .where('inviteCode', '==', inviteCode)
    .limit(1)
    .get();

  if (snap.empty) {
    throw new functions.https.HttpsError('not-found', 'Invalid invite code.');
  }

  const householdDoc = snap.docs[0];
  const household = householdDoc.data();

  if (household.parent1Uid === callerUid) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'You cannot join your own household.'
    );
  }

  if (household.parent2Uid) {
    throw new functions.https.HttpsError(
      'already-exists',
      'This household is already connected to a co-parent.'
    );
  }

  // Link parent2
  await householdDoc.ref.update({ parent2Uid: callerUid });

  // Update the joining parent's user doc with their householdId
  await db.doc(`users/${callerUid}`).set(
    { householdId: householdDoc.id },
    { merge: true }
  );

  return { householdId: householdDoc.id };
});

/**
 * revenuecatWebhook — receives RevenueCat server events and updates household subscription status.
 * Configure this URL in RevenueCat dashboard > Integrations > Webhooks.
 * Expects RC_WEBHOOK_SECRET env var to verify requests.
 */
export const revenuecatWebhook = functions.https.onRequest(async (req, res) => {
  const secret = process.env.RC_WEBHOOK_SECRET;
  if (secret && req.headers['x-revenuecat-signature'] !== secret) {
    res.status(401).send('Unauthorized');
    return;
  }

  const event = req.body?.event;
  if (!event) {
    res.status(400).send('Missing event');
    return;
  }

  const { type, app_user_id: householdId } = event as {
    type: string;
    app_user_id: string;
  };

  if (!householdId) {
    res.status(400).send('Missing app_user_id');
    return;
  }

  const activeEvents = new Set([
    'INITIAL_PURCHASE',
    'RENEWAL',
    'PRODUCT_CHANGE',
    'UNCANCELLATION',
  ]);
  const inactiveEvents = new Set([
    'CANCELLATION',
    'EXPIRATION',
    'BILLING_ISSUE',
  ]);

  const ref = db.collection('households').doc(householdId);
  const snap = await ref.get();

  if (!snap.exists) {
    res.status(404).send('Household not found');
    return;
  }

  if (activeEvents.has(type)) {
    await ref.update({ subscriptionActive: true });
  } else if (inactiveEvents.has(type)) {
    await ref.update({ subscriptionActive: false });
  }

  res.status(200).send('ok');
});
