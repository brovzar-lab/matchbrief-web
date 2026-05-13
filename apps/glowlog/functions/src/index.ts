import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// recalculateEfficacy
// Triggered when a productRating doc is written under any user.
// Recomputes avgStars + ratingCount in the productEfficacy top-level doc.
// ---------------------------------------------------------------------------
export const recalculateEfficacy = functions.firestore
  .document('users/{userId}/productRatings/{ratingId}')
  .onWrite(async (_change, context) => {
    const { userId } = context.params;

    // Collect all ratings for this user across all products that changed
    const ratingsBefore = _change.before.exists ? _change.before.data() : null;
    const ratingsAfter = _change.after.exists ? _change.after.data() : null;

    const productId: string | undefined =
      (ratingsAfter?.productId as string | undefined) ??
      (ratingsBefore?.productId as string | undefined);

    if (!productId) return null;

    // Fetch all ratings for this product
    const ratingsSnap = await db
      .collection('users')
      .doc(userId)
      .collection('productRatings')
      .where('productId', '==', productId)
      .get();

    const ratings = ratingsSnap.docs.map((d) => d.data() as { stars: number });
    const ratingCount = ratings.length;
    const avgStars =
      ratingCount > 0
        ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / ratingCount) * 10) / 10
        : 0;

    await db.collection('productEfficacy').doc(`${userId}_${productId}`).set(
      {
        productId,
        userId,
        avgStars,
        ratingCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    functions.logger.info(`Efficacy updated: ${productId} → ${avgStars} (${ratingCount} ratings)`);
    return null;
  });

// ---------------------------------------------------------------------------
// weeklyCheckReminder
// Scheduled every Sunday at 10am UTC. Sends FCM push to users who haven't
// logged a skin check this week.
// ---------------------------------------------------------------------------
export const weeklyCheckReminder = functions.pubsub
  .schedule('0 10 * * 0')
  .timeZone('UTC')
  .onRun(async (_context) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

    // Get all users
    const usersSnap = await db.collectionGroup('profile').get();
    const notificationPromises: Promise<void>[] = [];

    for (const profileDoc of usersSnap.docs) {
      const userId = profileDoc.ref.parent.parent?.id;
      if (!userId) continue;

      // Check if user logged a skin check this week
      const recentCheck = await db
        .collection('users')
        .doc(userId)
        .collection('skinChecks')
        .where('date', '>=', oneWeekAgoStr)
        .limit(1)
        .get();

      if (!recentCheck.empty) continue;

      // Get user FCM token (stored in profile)
      const profile = profileDoc.data() as Record<string, unknown>;
      const fcmToken = profile.fcmToken as string | undefined;
      if (!fcmToken) continue;

      notificationPromises.push(
        admin.messaging().send({
          token: fcmToken,
          notification: {
            title: 'Time for your weekly skin check! 🌸',
            body: 'Log a skin check to keep your glow journey on track.',
          },
          apns: {
            payload: { aps: { badge: 1 } },
          },
        }).then(() => {
          functions.logger.info(`Reminder sent to user ${userId}`);
        }).catch((err) => {
          functions.logger.warn(`Failed to send reminder to ${userId}: ${err.message}`);
        }),
      );
    }

    await Promise.all(notificationPromises);
    functions.logger.info(`Weekly reminders dispatched to ${notificationPromises.length} users`);
    return null;
  });

// ---------------------------------------------------------------------------
// generateProductReport
// HTTPS Callable (premium only). Returns structured JSON of product efficacy
// history for a given productId.
// ---------------------------------------------------------------------------
export const generateProductReport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { uid } = context.auth;
  const { productId } = data as { productId: string };

  if (!productId) {
    throw new functions.https.HttpsError('invalid-argument', 'productId is required.');
  }

  // Check premium entitlement (stored in profile)
  const profileSnap = await db.doc(`users/${uid}/profile/data`).get();
  const profile = profileSnap.data() as Record<string, unknown> | undefined;
  const isPremium = profile?.isPremium as boolean | undefined;

  if (!isPremium) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Product reports require a GlowLog Premium subscription.',
    );
  }

  // Fetch product doc
  const productSnap = await db.doc(`users/${uid}/products/${productId}`).get();
  if (!productSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Product not found.');
  }

  // Fetch all ratings
  const ratingsSnap = await db
    .collection('users')
    .doc(uid)
    .collection('productRatings')
    .where('productId', '==', productId)
    .orderBy('ratedAt', 'asc')
    .get();

  const ratings = ratingsSnap.docs.map((d) => d.data());

  // Fetch efficacy summary
  const efficacySnap = await db.doc(`productEfficacy/${uid}_${productId}`).get();
  const efficacy = efficacySnap.exists ? efficacySnap.data() : null;

  return {
    product: { id: productId, ...productSnap.data() },
    efficacy,
    ratingHistory: ratings,
    generatedAt: new Date().toISOString(),
  };
});
