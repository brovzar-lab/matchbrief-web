import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Anthropic from '@anthropic-ai/sdk';

admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OnboardingAnswer {
  questionKey: string;
  answer: string;
}

interface CareerDimensions {
  leadership: number;
  communication: number;
  strategy: number;
  execution: number;
  influence: number;
  selfAwareness: number;
}

type StepType = 'scenario' | 'reflection' | 'micro_lesson';
type ResponseFormat = 'text' | 'choice';

interface SessionStep {
  type: StepType;
  promptText: string;
  responseFormat: ResponseFormat;
  choices?: string[];
}

interface GeneratedSession {
  title: string;
  content: SessionStep[];
}

// ---------------------------------------------------------------------------
// classifyOnboarding
// Receives { answers: OnboardingAnswer[] }. Uses Claude Haiku to map the 10
// raw answers to 6 career dimensions (1-10) and writes the structured profile
// to Firestore.
// ---------------------------------------------------------------------------
export const classifyOnboarding = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { uid } = context.auth;
  const { answers } = data as { answers: OnboardingAnswer[] };

  if (!answers || answers.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'answers array is required.');
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const answersText = answers
    .map((a) => `${a.questionKey}: ${a.answer}`)
    .join('\n');

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: `You are a career coaching AI that analyzes professional onboarding responses and maps them to 6 career dimensions.
Each dimension should be rated 1-10 based on the evidence in the answers:
- 1-3: Clear weakness or early stage
- 4-6: Developing, some capability
- 7-9: Strong, consistent evidence
- 10: Exceptional/expert level

The 6 dimensions are:
- leadership: ability to lead, inspire, and develop others
- communication: clarity, persuasion, listening, adapting style to audience
- strategy: big-picture thinking, prioritization, long-range planning
- execution: delivery, follow-through, bias for action, accountability
- influence: cross-functional impact, stakeholder management, building trust without authority
- selfAwareness: knowing own strengths/gaps, openness to feedback, emotional intelligence

Respond ONLY with valid JSON in this exact shape:
{
  "leadership": 7,
  "communication": 6,
  "strategy": 5,
  "execution": 8,
  "influence": 5,
  "selfAwareness": 7,
  "topGrowthEdge": "brief 1-sentence description of the most important growth opportunity"
}`,
    messages: [
      {
        role: 'user',
        content: `Analyze these onboarding answers and rate each career dimension:\n\n${answersText}`,
      },
    ],
  });

  const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}';
  let dimensions: CareerDimensions & { topGrowthEdge?: string };

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    dimensions = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    dimensions = {
      leadership: 5, communication: 5, strategy: 5,
      execution: 5, influence: 5, selfAwareness: 5,
    };
  }

  if (!dimensions) {
    dimensions = {
      leadership: 5, communication: 5, strategy: 5,
      execution: 5, influence: 5, selfAwareness: 5,
    };
  }

  // Clamp all dimension values to 1-10
  const dimKeys: (keyof CareerDimensions)[] = [
    'leadership', 'communication', 'strategy', 'execution', 'influence', 'selfAwareness',
  ];
  for (const key of dimKeys) {
    dimensions[key] = Math.max(1, Math.min(10, Math.round(dimensions[key] ?? 5)));
  }

  const topGrowthEdge = dimensions.topGrowthEdge ?? '';
  delete (dimensions as any).topGrowthEdge;

  const profileRef = db.doc(`users/${uid}/profile/data`);
  await profileRef.set(
    {
      dimensions,
      topGrowthEdge,
      onboardingComplete: true,
      onboardingAnswers: answers,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  functions.logger.info('classifyOnboarding complete', { uid, dimensions });
  return { dimensions, topGrowthEdge };
});

// ---------------------------------------------------------------------------
// generateSession
// Receives { uid }. Reads profile + last 5 sessions, calls Claude Sonnet to
// generate a structured 5-step coaching session, writes it to Firestore, and
// returns the full session doc.
// ---------------------------------------------------------------------------
export const generateSession = functions
  .runWith({ timeoutSeconds: 120 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = context.auth.uid;

    // Load profile
    const profileSnap = await db.doc(`users/${uid}/profile/data`).get();
    if (!profileSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found. Complete onboarding first.');
    }
    const profile = profileSnap.data() as {
      dimensions: CareerDimensions;
      topGrowthEdge?: string;
      onboardingAnswers?: OnboardingAnswer[];
      currentStreak?: number;
      isPremium?: boolean;
    };

    // Load last 5 sessions
    const sessionsSnap = await db
      .collection(`users/${uid}/sessions`)
      .orderBy('date', 'desc')
      .limit(5)
      .get();

    const recentSessions = sessionsSnap.docs.map((d) => {
      const s = d.data() as { title?: string; rating?: number; resonatedText?: string };
      return `- "${s.title ?? 'Untitled'}" (rating: ${s.rating ?? 'not rated'})${s.resonatedText ? ` — resonated: "${s.resonatedText}"` : ''}`;
    });

    // Determine the weakest dimension to focus on
    const dims = profile.dimensions;
    const dimEntries = Object.entries(dims) as [keyof CareerDimensions, number][];
    const weakest = dimEntries.sort((a, b) => a[1] - b[1])[0];
    const targetDimension = weakest[0];
    const targetScore = weakest[1];

    const profileContext = `
Career profile:
- Leadership: ${dims.leadership}/10
- Communication: ${dims.communication}/10
- Strategy: ${dims.strategy}/10
- Execution: ${dims.execution}/10
- Influence: ${dims.influence}/10
- Self-Awareness: ${dims.selfAwareness}/10
- Top growth edge: ${profile.topGrowthEdge ?? 'Not specified'}
- Target dimension for today: ${targetDimension} (currently ${targetScore}/10)

Recent session history:
${recentSessions.length > 0 ? recentSessions.join('\n') : '- No prior sessions'}
`.trim();

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: `You are MicroMentor — an elite AI executive coach. You create highly personalized 5-minute career coaching sessions for busy professionals.

Each session must:
1. Target a specific career dimension weakness
2. Feel like a real conversation with a top-tier coach
3. Use concrete scenarios and frameworks, not generic advice
4. Progress logically: scenario → reflection → lesson → application → challenge
5. Be completable in 5 minutes total

Return ONLY valid JSON with this exact structure:
{
  "title": "Engaging session title (4-8 words, specific not generic)",
  "content": [
    {
      "type": "scenario" | "reflection" | "micro_lesson",
      "promptText": "The full prompt text for this step",
      "responseFormat": "text" | "choice",
      "choices": ["option 1", "option 2", "option 3", "option 4"]
    }
  ]
}

Rules:
- Exactly 5 steps in content
- Steps should alternate types: scenario → reflection → micro_lesson → reflection → scenario
- For "choice" responseFormat, provide exactly 3-4 choices, each 5-15 words
- For "text" responseFormat, omit the choices field entirely
- promptText for micro_lesson steps should include the framework/insight in **bold markdown** at the start
- Make it specific to the target dimension — not a generic coaching exercise
- Avoid repeating topics from recent sessions`,
      messages: [
        {
          role: 'user',
          content: `Generate a personalized coaching session based on this profile:\n\n${profileContext}\n\nFocus on improving the ${targetDimension} dimension today.`,
        },
      ],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}';
    let generated: GeneratedSession;

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      generated = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      throw new functions.https.HttpsError('internal', 'AI returned invalid session format.');
    }

    if (!generated?.title || !Array.isArray(generated.content) || generated.content.length === 0) {
      throw new functions.https.HttpsError('internal', 'AI returned incomplete session data.');
    }

    // Write session to Firestore
    const now = new Date();
    const sessionRef = db.collection(`users/${uid}/sessions`).doc();

    const sessionDoc = {
      title: generated.title,
      content: generated.content,
      date: now.toISOString(),
      rating: null,
      resonatedText: null,
      completedAt: null,
      targetDimension,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await sessionRef.set(sessionDoc);

    // Update streak
    const profileRef = db.doc(`users/${uid}/profile/data`);
    const lastSessionDate = profileSnap.get('lastSessionDate') as string | null;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = lastSessionDate
      ? new Date(lastSessionDate).toDateString() === yesterday.toDateString()
      : false;
    const currentStreak = (profile.currentStreak ?? 0);

    await profileRef.update({
      lastSessionDate: now.toISOString(),
      currentStreak: wasYesterday ? currentStreak + 1 : 1,
    });

    functions.logger.info('generateSession complete', { uid, sessionId: sessionRef.id, targetDimension });

    return {
      id: sessionRef.id,
      ...sessionDoc,
      createdAt: now.toISOString(),
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
