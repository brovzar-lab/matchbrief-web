import Anthropic from '@anthropic-ai/sdk';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

const FREE_LIMIT = 5;
const PRO_LIMIT = 50;

const SYNTHESIS_SYSTEM_PROMPT = `You are a content synthesis engine. Analyze the provided text and return a structured JSON analysis.

Return ONLY valid JSON with exactly this structure — no markdown fences, no explanation:
{
  "title": "concise title (max 80 chars)",
  "summary": "2-3 sentence summary of the core message",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "actionItems": ["action 1", "action 2"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Rules:
- title: derive from content if not obvious
- summary: capture the essential argument or purpose
- keyInsights: 3-5 specific, concrete takeaways (not vague platitudes)
- actionItems: 1-3 things the reader should do or consider; omit if none apply
- tags: 3-5 lowercase topic/theme labels with hyphens (e.g. "machine-learning", "api-design")`;

export type SynthesisOutput = {
  title: string;
  summary: string;
  keyInsights: string[];
  actionItems: string[];
  tags: string[];
};

export async function checkAndIncrementRateLimit(uid: string): Promise<void> {
  const db = getFirestore();
  const month = new Date().toISOString().slice(0, 7);

  await db.runTransaction(async (tx) => {
    const profileRef = db.doc(`users/${uid}`);
    const usageRef = db.doc(`users/${uid}/monthlyUsage/${month}`);

    const [profileSnap, usageSnap] = await Promise.all([tx.get(profileRef), tx.get(usageRef)]);

    const tier = profileSnap.exists ? (profileSnap.data()?.tier as string) ?? 'free' : 'free';
    const limit = tier === 'pro' ? PRO_LIMIT : FREE_LIMIT;
    const count = usageSnap.exists ? (usageSnap.data()?.count as number) ?? 0 : 0;

    if (count >= limit) {
      throw new HttpsError(
        'resource-exhausted',
        `rate-limit: ${tier} tier allows ${limit} syntheses/month`,
      );
    }

    tx.set(usageRef, { count: FieldValue.increment(1), month, tier }, { merge: true });

    if (!profileSnap.exists) {
      tx.set(profileRef, { uid, tier: 'free', createdAt: FieldValue.serverTimestamp() });
    }
  });
}

export async function runSynthesis(
  text: string,
  apiKey: string,
): Promise<SynthesisOutput> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYNTHESIS_SYSTEM_PROMPT,
        // Prompt caching: system prompt is identical across all synthesis calls
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Synthesize this content:\n\n${text.slice(0, 60000)}`,
      },
    ],
  });

  const rawText =
    response.content[0].type === 'text' ? response.content[0].text.trim() : '{}';

  try {
    const parsed = JSON.parse(rawText) as Partial<SynthesisOutput>;
    return {
      title: String(parsed.title ?? 'Untitled'),
      summary: String(parsed.summary ?? ''),
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights.map(String) : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems.map(String) : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
    };
  } catch {
    throw new HttpsError('internal', 'Failed to parse synthesis output from AI');
  }
}

export async function saveSynthesis(
  uid: string,
  synthesis: SynthesisOutput,
  extra: Record<string, unknown>,
): Promise<string> {
  const db = getFirestore();
  const ref = db.collection(`users/${uid}/syntheses`).doc();
  await ref.set({
    ...synthesis,
    ...extra,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
