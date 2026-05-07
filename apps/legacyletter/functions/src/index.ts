import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';
import sgMail from '@sendgrid/mail';
import { getStorage } from 'firebase-admin/storage';

admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// scheduleLegacyDelivery
// Triggered by Cloud Scheduler on a fixed schedule (e.g. daily at 09:00 UTC).
// Queries for legacies with deliveryDate <= now and status = 'scheduled',
// sends via SendGrid, and marks them 'delivered'.
// ---------------------------------------------------------------------------
export const scheduleLegacyDelivery = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async (_context) => {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      functions.logger.error('SENDGRID_API_KEY not set — aborting delivery run');
      return;
    }
    sgMail.setApiKey(apiKey);
    await runDelivery();
  });

// Exported for emulator integration tests (test-delivery.ts).
export async function runDelivery(): Promise<void> {
  const now = admin.firestore.Timestamp.now();
  const snapshot = await db
    .collectionGroup('legacies')
    .where('status', '==', 'scheduled')
    .where('deliveryDate', '<=', now)
    .get();

  functions.logger.info(`Found ${snapshot.size} legacy/legacies to deliver`);

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Idempotency guard — handles scheduler double-fire
    if (data.deliveredAt != null) {
      functions.logger.info(`Legacy ${doc.id} already has deliveredAt — skipping`);
      continue;
    }

    const recipients: Array<{ name: string; email: string }> = data.recipients ?? [];
    if (recipients.length === 0) {
      functions.logger.warn(`Legacy ${doc.id} has no recipients — skipping`);
      continue;
    }

    try {
      const html = await buildEmailBody(
        data.type as string,
        data.content as string,
        data.storageRef as string,
        data.title as string,
      );

      await sgMail.send({
        to: recipients.map((r) => ({ name: r.name, email: r.email })),
        from: { name: 'LegacyLetter', email: 'noreply@legacyletter.app' },
        subject: `A legacy message for you: "${data.title as string}"`,
        html,
      });

      await doc.ref.update({ status: 'delivered', deliveredAt: now });
      functions.logger.info(`Legacy ${doc.id} delivered`);
    } catch (err) {
      // Log and continue — one failed send must not block the rest
      functions.logger.error(`Failed to deliver legacy ${doc.id}`, err);
    }
  }

  functions.logger.info('Delivery run complete');
}

async function buildEmailBody(
  type: string,
  content: string,
  storageRef: string,
  title: string,
): Promise<string> {
  if (type === 'text') {
    return buildTextEmail(content, title);
  }
  const [url] = await getStorage()
    .bucket()
    .file(storageRef)
    .getSignedUrl({ action: 'read', expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return buildMediaEmail(type, url, title);
}

// ---------------------------------------------------------------------------
// onLegacyCreate
// Validates free tier limits and storage quotas when a legacy document is created.
// ---------------------------------------------------------------------------
export const onLegacyCreate = functions.firestore
  .document('users/{uid}/legacies/{legacyId}')
  .onCreate(async (snap, context) => {
    const { uid } = context.params;
    const legacy = snap.data();

    const userDoc = await db.doc(`users/${uid}`).get();
    const subscription = userDoc.data()?.subscription ?? { tier: 'free' };

    if (subscription.tier === 'free') {
      const existingSnap = await db
        .collection(`users/${uid}/legacies`)
        .where('type', '==', 'text')
        .get();

      // Count existing text legacies (excluding the one just created)
      const textCount = existingSnap.docs.filter((d) => d.id !== snap.id).length;

      if (textCount >= 3) {
        functions.logger.warn(`Free user ${uid} exceeded text legacy limit — deleting ${snap.id}`);
        await snap.ref.delete();
        await db.collection(`users/${uid}/notifications`).add({
          type: 'quota_exceeded',
          title: 'Legacy limit reached',
          message: 'Free plan allows up to 3 text legacies. Upgrade to add more.',
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
      }

      if (legacy.type !== 'text') {
        functions.logger.warn(`Free user ${uid} attempted ${legacy.type as string} legacy — deleting`);
        await snap.ref.delete();
        await db.collection(`users/${uid}/notifications`).add({
          type: 'quota_exceeded',
          title: 'Feature not available',
          message: 'Voice and video legacies require a Pro or Vault subscription.',
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
      }
    }

    if (subscription.tier === 'pro_monthly' && legacy.type === 'video') {
      functions.logger.warn(`Pro user ${uid} attempted video legacy — deleting (requires Vault)`);
      await snap.ref.delete();
      await db.collection(`users/${uid}/notifications`).add({
        type: 'quota_exceeded',
        title: 'Video requires Vault plan',
        message: 'Video legacies are available on the Vault plan. Upgrade to record video messages.',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// ---------------------------------------------------------------------------
// revenueCatWebhook
// Receives RevenueCat webhook events and syncs subscription status to Firestore.
// Set the webhook URL in RevenueCat dashboard → Project → Integrations → Webhooks.
// ---------------------------------------------------------------------------
export const revenueCatWebhook = functions.https.onRequest(async (req, res) => {
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.REVENUECAT_WEBHOOK_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    functions.logger.warn('RevenueCat webhook: unauthorized request');
    res.status(401).send('Unauthorized');
    return;
  }

  const event = req.body as {
    event: {
      type: string;
      app_user_id: string;
      product_id: string;
      expiration_at_ms?: number;
    };
  };

  const { type, app_user_id: uid, product_id, expiration_at_ms } = event.event;
  functions.logger.info(`RevenueCat event: ${type} for uid ${uid}`);

  const tierMap: Record<string, string> = {
    'com.lemaa.legacyletter.pro_monthly': 'pro_monthly',
    'com.lemaa.legacyletter.vault_monthly': 'vault_monthly',
    'com.lemaa.legacyletter.lifetime': 'lifetime',
  };

  const tier = tierMap[product_id] ?? 'free';

  switch (type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE':
      await db.doc(`users/${uid}`).set(
        {
          subscription: {
            tier,
            expiresAt: expiration_at_ms
              ? admin.firestore.Timestamp.fromMillis(expiration_at_ms)
              : null,
            revenueCatId: uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );
      break;

    case 'EXPIRATION':
    case 'CANCELLATION':
      await db.doc(`users/${uid}`).set(
        {
          subscription: {
            tier: 'free',
            expiresAt: null,
            revenueCatId: uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );
      break;

    default:
      functions.logger.info(`Unhandled RevenueCat event type: ${type}`);
  }

  res.status(200).send('OK');
});

// ---------------------------------------------------------------------------
// Email template helpers
// ---------------------------------------------------------------------------
function buildTextEmail(content: string, title: string): string {
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  return `
    <div style="font-family: Georgia, serif; max-width: 640px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
      <p style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">A Legacy Letter</p>
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 32px; color: #111;">${title}</h1>
      <div style="font-size: 18px; line-height: 1.8; color: #333;">${escaped}</div>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        This message was written with love and delivered by LegacyLetter.
      </p>
    </div>
  `;
}

function buildMediaEmail(type: string, signedUrl: string, title: string): string {
  const icon = type === 'voice' ? '🎙️' : '🎥';
  const label = type === 'voice' ? 'Voice Memo' : 'Video Message';
  return `
    <div style="font-family: Georgia, serif; max-width: 640px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
      <p style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">A Legacy Letter</p>
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 32px; color: #111;">${title}</h1>
      <div style="background: #f5f5f5; border-radius: 12px; padding: 32px; text-align: center;">
        <p style="font-size: 48px; margin: 0 0 12px;">${icon}</p>
        <p style="font-size: 18px; font-weight: 600; color: #333; margin: 0 0 20px;">${label}</p>
        <a href="${signedUrl}"
           style="display: inline-block; background: #1a1a1a; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
          Open ${label}
        </a>
        <p style="font-size: 12px; color: #aaa; margin-top: 16px;">This link expires in 7 days.</p>
      </div>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        This message was recorded with love and delivered by LegacyLetter.
      </p>
    </div>
  `;
}
