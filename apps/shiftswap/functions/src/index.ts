import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// setUserClaims — called client-side after sign-up to provision JWT claims.
// Sets companyId, locationId, and role on the Firebase Auth token.
// ---------------------------------------------------------------------------
export const setUserClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { uid, role } = data as { uid: string; role: 'manager' | 'worker' };

  if (!uid || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'uid and role are required.');
  }

  // Only the user themselves may set their own claims on first sign-up
  if (context.auth.uid !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot set claims for another user.');
  }

  const userDoc = await db.doc(`users/${uid}`).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User document not found.');
  }

  const { companyId = '', locationId = '' } = userDoc.data() as {
    companyId?: string;
    locationId?: string;
  };

  await admin.auth().setCustomUserClaims(uid, { companyId, locationId, role });

  return { success: true };
});

// ---------------------------------------------------------------------------
// onSwapRequestWrite — Firestore trigger on swapRequests.
//
// On claim (status transitions to "claimed"):
//   1. Computes whether claimant would exceed the location's overtimeThresholdHours
//      for the ISO week containing the shift.
//   2. Writes overtimeWarning back to the request document.
//   3. Sends FCM push notification to the manager.
//
// On approve/deny (status transitions to "approved" or "denied"):
//   Sends FCM push notification to the requester and claimant.
// ---------------------------------------------------------------------------
export const onSwapRequestWrite = functions.firestore
  .document('companies/{companyId}/locations/{locationId}/swapRequests/{requestId}')
  .onWrite(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!after) return; // document deleted — ignore

    const { companyId, locationId } = context.params;
    const statusBefore = before?.status as string | undefined;
    const statusAfter = after.status as string;

    // -----------------------------------------------------------------------
    // CLAIM: compute overtime warning and notify manager
    // -----------------------------------------------------------------------
    if (statusAfter === 'claimed' && statusBefore !== 'claimed') {
      const claimantId = after.claimantId as string;
      const shiftId = after.shiftId as string;

      const [shiftSnap, locationSnap] = await Promise.all([
        db.doc(`companies/${companyId}/locations/${locationId}/shifts/${shiftId}`).get(),
        db.doc(`companies/${companyId}/locations/${locationId}`).get(),
      ]);

      let overtimeWarning = false;

      if (shiftSnap.exists && locationSnap.exists) {
        const shiftData = shiftSnap.data()!;
        const locationData = locationSnap.data()!;
        const threshold: number = (locationData['overtimeThresholdHours'] as number) ?? 40;

        const shiftStart: admin.firestore.Timestamp = shiftData['start'];
        const shiftEnd: admin.firestore.Timestamp = shiftData['end'];
        const newShiftHours =
          (shiftEnd.toMillis() - shiftStart.toMillis()) / 3_600_000;

        // ISO week boundaries (Monday 00:00 – Sunday 23:59:59)
        const shiftDate = shiftStart.toDate();
        const dayOfWeek = shiftDate.getDay(); // 0=Sun, 1=Mon…6=Sat
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(shiftDate);
        weekStart.setDate(shiftDate.getDate() - daysFromMonday);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        // Sum claimant's already-approved shifts for this ISO week
        const approvedSnap = await db
          .collection(`companies/${companyId}/locations/${locationId}/swapRequests`)
          .where('claimantId', '==', claimantId)
          .where('status', '==', 'approved')
          .get();

        let approvedHours = 0;
        for (const reqDoc of approvedSnap.docs) {
          const reqData = reqDoc.data();
          const s = await db
            .doc(`companies/${companyId}/locations/${locationId}/shifts/${reqData['shiftId']}`)
            .get();
          if (!s.exists) continue;
          const sd = s.data()!;
          const sStart: admin.firestore.Timestamp = sd['start'];
          const sEnd: admin.firestore.Timestamp = sd['end'];
          if (
            sStart.toDate() >= weekStart &&
            sStart.toDate() < weekEnd
          ) {
            approvedHours += (sEnd.toMillis() - sStart.toMillis()) / 3_600_000;
          }
        }

        overtimeWarning = approvedHours + newShiftHours >= threshold;
      }

      await change.after.ref.update({ overtimeWarning });

      // Notify manager(s) — send to all workers with role === "manager" in this location
      const managersSnap = await db
        .collection(`companies/${companyId}/locations/${locationId}/workers`)
        .where('role', '==', 'manager')
        .get();

      const tokens = managersSnap.docs
        .map((d) => d.data()['fcmToken'] as string | undefined)
        .filter((t): t is string => !!t);

      if (tokens.length > 0) {
        await admin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title: 'Swap needs approval',
            body: overtimeWarning
              ? 'A shift swap was claimed — overtime warning!'
              : 'A shift swap is waiting for your approval.',
          },
          data: { requestId: change.after.id, locationId, companyId },
        });
      }
    }

    // -----------------------------------------------------------------------
    // APPROVE / DENY: notify requester and claimant
    // -----------------------------------------------------------------------
    if (
      (statusAfter === 'approved' || statusAfter === 'denied') &&
      statusBefore !== statusAfter
    ) {
      const requesterId = after.requesterId as string;
      const claimantId = after.claimantId as string | null;
      const uids = [requesterId, claimantId].filter((id): id is string => !!id);

      const tokenPromises = uids.map((uid) =>
        db.doc(`companies/${companyId}/locations/${locationId}/workers/${uid}`).get()
      );
      const workerDocs = await Promise.all(tokenPromises);
      const tokens = workerDocs
        .map((d) => (d.data() ?? {})['fcmToken'] as string | undefined)
        .filter((t): t is string => !!t);

      if (tokens.length > 0) {
        const verb = statusAfter === 'approved' ? 'approved' : 'denied';
        await admin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title: `Swap ${verb}`,
            body: `Your shift swap request has been ${verb}.`,
          },
          data: { requestId: change.after.id, locationId, companyId },
        });
      }
    }
  });

// ---------------------------------------------------------------------------
// revenuecatWebhook — syncs per-location subscription status from RevenueCat.
// Set RC_WEBHOOK_SECRET env var and configure this URL in the RC dashboard.
// ---------------------------------------------------------------------------
export const revenuecatWebhook = functions.https.onRequest(async (req, res) => {
  const secret = process.env['RC_WEBHOOK_SECRET'];
  if (secret && req.headers['x-revenuecat-signature'] !== secret) {
    res.status(401).send('Unauthorized');
    return;
  }

  const event = req.body?.event as
    | { type: string; app_user_id: string }
    | undefined;

  if (!event?.type || !event.app_user_id) {
    res.status(400).send('Missing event or app_user_id');
    return;
  }

  const { type, app_user_id: locationDocId } = event;

  const activeEvents = new Set([
    'INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION',
  ]);
  const inactiveEvents = new Set([
    'CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE',
  ]);

  // app_user_id format: "{companyId}::{locationId}"
  const [companyId, locationId] = locationDocId.split('::');
  if (!companyId || !locationId) {
    res.status(400).send('Invalid app_user_id format. Expected companyId::locationId');
    return;
  }

  const ref = db.doc(`companies/${companyId}/locations/${locationId}`);
  const snap = await ref.get();
  if (!snap.exists) {
    res.status(404).send('Location not found');
    return;
  }

  if (activeEvents.has(type)) {
    await ref.update({ subscriptionActive: true });
  } else if (inactiveEvents.has(type)) {
    await ref.update({ subscriptionActive: false });
  }

  res.status(200).send('ok');
});
