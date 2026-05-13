import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Anthropic from '@anthropic-ai/sdk';

admin.initializeApp();
const db = admin.firestore();

type MemoCategory = 'idea' | 'task' | 'reminder' | 'note';

interface ClassifyResult {
  category: MemoCategory;
  extractedDate: string | null;
}

// ---------------------------------------------------------------------------
// classifyMemo
// Receives { uid, text, durationSec }. Calls Claude Haiku to classify into
// idea/task/reminder/note and extract a date string for reminders.
// Writes the memo doc to Firestore, enforces 20/month free limit.
// Returns { memoId, category, extractedDate }.
// ---------------------------------------------------------------------------
export const classifyMemo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { uid } = context.auth;
  const { text, durationSec } = data as { text: string; durationSec: number };

  if (!text || text.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'text is required.');
  }

  // Free limit enforcement
  const profileRef = db.doc(`users/${uid}/profile/data`);
  const profileSnap = await profileRef.get();
  const profileData = profileSnap.data() as { memoCountThisMonth?: number; isPremium?: boolean } | undefined;
  const memoCount = profileData?.memoCountThisMonth ?? 0;
  const isPremium = profileData?.isPremium ?? false;

  if (!isPremium && memoCount >= 20) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Free limit of 20 memos/month reached. Upgrade to Premium for unlimited capture.',
    );
  }

  // Classify with Claude Haiku
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Classify the following voice memo into exactly one category: idea, task, reminder, or note.

Categories:
- idea: a new concept, suggestion, or creative thought
- task: something the speaker needs to do or complete
- reminder: something with an implicit or explicit future date/time ("call mom on Sunday", "book hotel before Friday")
- note: an observation, fact, or record of something that happened

If the category is "reminder", also extract the date/time as an ISO 8601 string relative to today (${new Date().toISOString().split('T')[0]}). If no specific date is mentioned for a reminder, set extractedDate to null.

Return ONLY valid JSON with this exact shape:
{
  "category": "idea" | "task" | "reminder" | "note",
  "extractedDate": "ISO string" | null
}

Voice memo:
"${text.replace(/"/g, "'")}"`,
      },
    ],
  });

  const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}';
  let result: ClassifyResult;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    result = jsonMatch ? JSON.parse(jsonMatch[0]) : { category: 'note', extractedDate: null };
  } catch {
    result = { category: 'note', extractedDate: null };
  }

  const validCategories: MemoCategory[] = ['idea', 'task', 'reminder', 'note'];
  if (!validCategories.includes(result.category)) {
    result.category = 'note';
  }

  // Write memo to Firestore
  const now = admin.firestore.Timestamp.now();
  const memoRef = db.collection(`users/${uid}/memos`).doc();

  const batch = db.batch();

  batch.set(memoRef, {
    text: text.trim(),
    category: result.category,
    createdAt: now,
    durationSec: durationSec ?? 0,
    extractedDate: result.extractedDate
      ? admin.firestore.Timestamp.fromDate(new Date(result.extractedDate))
      : null,
    isPremium: false,
  });

  // Increment memo count
  batch.set(
    profileRef,
    { memoCountThisMonth: admin.firestore.FieldValue.increment(1) },
    { merge: true },
  );

  await batch.commit();

  return {
    memoId: memoRef.id,
    category: result.category,
    extractedDate: result.extractedDate,
  };
});

// ---------------------------------------------------------------------------
// getWeeklySummary
// Aggregates the last 7 days of memos by category and computes the conversion
// rate (% of tasks/reminders that had an extractedDate).
// ---------------------------------------------------------------------------
export const getWeeklySummary = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { uid } = context.auth;
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const snap = await db
    .collection(`users/${uid}/memos`)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(cutoff))
    .get();

  const memos = snap.docs.map((d) => d.data() as {
    category: MemoCategory;
    extractedDate: admin.firestore.Timestamp | null;
  });

  const counts: Record<MemoCategory, number> = { idea: 0, task: 0, reminder: 0, note: 0 };
  let actionableTotal = 0;
  let actionableWithDate = 0;

  for (const memo of memos) {
    if (counts[memo.category] !== undefined) {
      counts[memo.category]++;
    }
    if (memo.category === 'task' || memo.category === 'reminder') {
      actionableTotal++;
      if (memo.extractedDate) actionableWithDate++;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const conversionRate = actionableTotal > 0 ? Math.round((actionableWithDate / actionableTotal) * 100) : 0;

  return {
    counts,
    total,
    conversionRate,
    generatedAt: new Date().toISOString(),
  };
});

// ---------------------------------------------------------------------------
// rcWebhook
// RevenueCat webhook — syncs premium status to Firestore user profile.
// ---------------------------------------------------------------------------
export const rcWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const authHeader = req.headers['authorization'];
  const expectedSecret = process.env.RC_WEBHOOK_SECRET;
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    res.status(401).send('Unauthorized');
    return;
  }

  const event = req.body as {
    event: {
      type: string;
      app_user_id: string;
      entitlement_ids?: string[];
    };
  };

  const { type, app_user_id: uid, entitlement_ids = [] } = event.event;
  if (!uid) {
    res.status(400).send('Missing app_user_id');
    return;
  }

  const profileRef = db.doc(`users/${uid}/profile/data`);
  const isPremium =
    ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION'].includes(type) &&
    entitlement_ids.includes('premium');
  const isCancelled = ['EXPIRATION', 'CANCELLATION', 'BILLING_ISSUE'].includes(type);

  if (isPremium) {
    await profileRef.set({ isPremium: true }, { merge: true });
  } else if (isCancelled) {
    await profileRef.set({ isPremium: false }, { merge: true });
  }

  functions.logger.info('rcWebhook processed', { type, uid, isPremium });
  res.status(200).json({ ok: true });
});
