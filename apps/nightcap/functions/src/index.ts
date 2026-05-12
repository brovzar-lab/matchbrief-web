import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// ---------------------------------------------------------------------------
// transcribeVoice
// Accepts a Firebase Storage path to an m4a audio file, validates size,
// calls OpenAI Whisper, extracts tags, and returns { transcript, tags }.
// The client never holds the OpenAI API key.
// ---------------------------------------------------------------------------
export const transcribeVoice = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { audioStoragePath } = data as { audioStoragePath: string };
  if (!audioStoragePath) {
    throw new functions.https.HttpsError('invalid-argument', 'audioStoragePath is required.');
  }

  // Enforce uid-scoped storage path
  const expectedPrefix = `users/${context.auth.uid}/audio/`;
  if (!audioStoragePath.startsWith(expectedPrefix)) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid audio path.');
  }

  const bucket = storage.bucket();
  const file = bucket.file(audioStoragePath);

  // Validate size before calling Whisper (max 5 MB)
  const [metadata] = await file.getMetadata();
  const sizeBytes = Number(metadata.size ?? 0);
  if (sizeBytes > 5 * 1024 * 1024) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Audio file exceeds 5 MB limit (${(sizeBytes / 1024 / 1024).toFixed(1)} MB).`,
    );
  }

  const [audioBuffer] = await file.download();

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { File } = await import('node:buffer') as unknown as { File: typeof globalThis.File };

  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: new File([audioBuffer], 'audio.m4a', { type: 'audio/m4a' }),
    response_format: 'text',
  });

  const transcript = typeof transcription === 'string' ? transcription : (transcription as any).text ?? '';

  // Extract 2-5 concise lowercase tags from the transcript
  const tags = extractTags(transcript);

  return { transcript, tags };
});

function extractTags(transcript: string): string[] {
  // Simple keyword extraction — a real implementation could call an LLM.
  // For MVP we look for known productivity/wellbeing keywords.
  const keywords = [
    'focus', 'meetings', 'deep-work', 'energy', 'flow', 'blocked', 'team',
    'productivity', 'sleep', 'exercise', 'stress', 'clarity', 'motivation',
    'creative', 'distracted', 'social', 'recovery', 'planning', 'shipping',
  ];
  const lower = transcript.toLowerCase();
  return keywords.filter((k) => lower.includes(k)).slice(0, 5);
}

// ---------------------------------------------------------------------------
// generatePatterns
// Called manually (from the app) or scheduled after the 14th journaling day.
// Fetches 14+ days of journal entries for the user, calls Claude to generate
// pattern cards, and writes them to Firestore.
// ---------------------------------------------------------------------------
export const generatePatterns = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const uid = context.auth.uid;
  const { rangeFrom, rangeTo } = data as { rangeFrom?: string; rangeTo?: string };

  // Fetch last 30 days of journal entries
  const snap = await db.collection(`users/${uid}/journals`).orderBy('createdAt', 'desc').limit(30).get();

  if (snap.empty) {
    throw new functions.https.HttpsError('failed-precondition', 'Not enough journal entries yet.');
  }

  const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
    id: string;
    transcript: string;
    tags: string[];
    ratings: { energy: number; mood: number; focus: number; social: number; output: number };
    createdAt: admin.firestore.Timestamp;
  }>;

  if (entries.length < 14) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `Need at least 14 journal entries to generate patterns. Have ${entries.length}.`,
    );
  }

  const entrySummaries = entries
    .map((e) => {
      const date = e.createdAt.toDate().toISOString().split('T')[0];
      const r = e.ratings;
      return `${date}: energy=${r.energy} mood=${r.mood} focus=${r.focus} social=${r.social} output=${r.output}\nTags: ${e.tags.join(', ')}\nTranscript excerpt: "${e.transcript.slice(0, 280)}"`;
    })
    .join('\n\n---\n\n');

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a knowledge worker's end-of-day voice journal data over ${entries.length} days. Each entry includes 5 dimension ratings (1–10), AI tags, and a transcript excerpt.

Your task: identify 3–4 specific, actionable pattern cards. Each card must:
- Be grounded in the actual data (cite specific rating differences, day-of-week patterns, correlations)
- Include a concrete, non-obvious insight
- End with one actionable recommendation
- Use plain, direct language — no corporate speak

Return ONLY a JSON array with this exact shape:
[
  {
    "emoji": "⚡",
    "title": "Short descriptive title (max 8 words)",
    "body": "2–4 sentence insight with data references and one actionable recommendation."
  }
]

Journal data:
${entrySummaries}`,
      },
    ],
  });

  const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
  let cards: Array<{ emoji: string; title: string; body: string }>;
  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    cards = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    throw new functions.https.HttpsError('internal', 'Failed to parse pattern cards from LLM response.');
  }

  const from = entries[entries.length - 1].createdAt.toDate().toISOString().split('T')[0];
  const to = entries[0].createdAt.toDate().toISOString().split('T')[0];
  const now = admin.firestore.FieldValue.serverTimestamp();

  const batch = db.batch();
  for (const card of cards) {
    const ref = db.collection(`users/${uid}/patterns`).doc();
    batch.set(ref, {
      title: card.title,
      body: card.body,
      emoji: card.emoji ?? '✨',
      generatedAt: now,
      dataRange: { from, to },
    });
  }
  await batch.commit();

  return { generated: cards.length, from, to };
});

// ---------------------------------------------------------------------------
// rcWebhook
// RevenueCat webhook — syncs subscription tier to Firestore user profile.
// Set in RevenueCat dashboard: POST https://<region>-<project>.cloudfunctions.net/nightcap-rcWebhook
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
      expiration_at_ms?: number;
    };
  };

  const { type, app_user_id: uid, entitlement_ids = [], expiration_at_ms } = event.event;

  if (!uid) {
    res.status(400).send('Missing app_user_id');
    return;
  }

  const profileRef = db.doc(`users/${uid}/profile`);
  const isPremium =
    ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION'].includes(type) &&
    entitlement_ids.includes('premium');

  const isCancelled =
    ['EXPIRATION', 'CANCELLATION', 'BILLING_ISSUE'].includes(type);

  if (isPremium) {
    await profileRef.set({ tier: 'premium' }, { merge: true });
  } else if (isCancelled) {
    await profileRef.set({ tier: 'free' }, { merge: true });
  }

  functions.logger.info('rcWebhook processed', { type, uid, isPremium, isCancelled });
  res.status(200).json({ ok: true });
});
