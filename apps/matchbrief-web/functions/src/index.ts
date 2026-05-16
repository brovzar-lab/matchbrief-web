import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Anthropic from '@anthropic-ai/sdk';
import pdfParse from 'pdf-parse';

admin.initializeApp();
const db = admin.firestore();

interface AnalysisKeyword {
  word: string;
  status: 'green' | 'yellow' | 'red';
}

interface BulletRewrite {
  original: string;
  rewritten: string;
}

interface AnalysisResult {
  score: number;
  keywords: AnalysisKeyword[];
  rewrittenBullets: BulletRewrite[];
  coverLetters: [string, string, string];
}

// ---------------------------------------------------------------------------
// analyzeApplication
// Callable CF: auth required. Free tier max 3 analyses/month.
// Calls Claude claude-sonnet-4-6, returns structured JSON, saves to Firestore.
// ---------------------------------------------------------------------------
export const analyzeApplication = functions
  .runWith({ secrets: ['ANTHROPIC_API_KEY'], timeoutSeconds: 120, memory: '1GB' })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { uid } = context.auth;
    const { jobDescription, resumeText } = data as {
      jobDescription: string;
      resumeText: string;
    };

    if (!jobDescription?.trim() || !resumeText?.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'jobDescription and resumeText are required.');
    }

    // Enforce free tier limit (3 analyses/month)
    const profileRef = db.doc(`users/${uid}/profile/data`);
    const profileSnap = await profileRef.get();
    const profile = profileSnap.data() as {
      tier?: string;
      analysisCount?: number;
      analysisResetAt?: admin.firestore.Timestamp | string;
    } | undefined;

    if (profile?.tier !== 'pro') {
      const count = profile?.analysisCount ?? 0;
      const resetAt = profile?.analysisResetAt
        ? (profile.analysisResetAt instanceof admin.firestore.Timestamp
          ? profile.analysisResetAt.toDate()
          : new Date(profile.analysisResetAt as string))
        : new Date(0);

      const now = new Date();
      if (now > resetAt) {
        // Reset counter for new month
        await profileRef.set(
          { analysisCount: 0, analysisResetAt: new Date(now.getFullYear(), now.getMonth() + 1, 1) },
          { merge: true },
        );
      } else if (count >= 3) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Free tier limit reached (3 analyses/month). Upgrade to Pro to continue.',
        );
      }
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a professional job application coach. Analyze the job description and resume below. Return ONLY valid JSON with no markdown fences.

Job Description:
"""
${jobDescription.slice(0, 4000)}
"""

Resume:
"""
${resumeText.slice(0, 4000)}
"""

Return this exact JSON shape:
{
  "score": <integer 0-100, how well the resume matches the job>,
  "keywords": [
    { "word": "<important keyword from JD>", "status": "green" | "yellow" | "red" }
  ],
  "rewrittenBullets": [
    { "original": "<existing resume bullet>", "rewritten": "<stronger version with quantified impact>" }
  ],
  "coverLetters": [
    "<formal cover letter ~200 words>",
    "<conversational cover letter ~200 words>",
    "<bold cover letter ~200 words>"
  ]
}

Rules:
- score: integer 0-100
- keywords: 10-18 items. green = present and strong, yellow = partially present or weak, red = missing but important
- rewrittenBullets: 3-6 items. Pick the weakest bullets. Add action verbs and quantified results where possible.
- coverLetters: exactly 3 strings in order [formal, conversational, bold]. Each ~200 words. Address the specific role and company.`,
        },
      ],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}';

    let result: AnalysisResult;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      result = jsonMatch ? (JSON.parse(jsonMatch[0]) as AnalysisResult) : (() => { throw new Error('no json'); })();
    } catch {
      throw new functions.https.HttpsError('internal', 'Failed to parse Claude response.');
    }

    // Validate shape
    if (
      typeof result.score !== 'number' ||
      !Array.isArray(result.keywords) ||
      !Array.isArray(result.rewrittenBullets) ||
      !Array.isArray(result.coverLetters) ||
      result.coverLetters.length < 3
    ) {
      throw new functions.https.HttpsError('internal', 'Unexpected response shape from Claude.');
    }

    const coverLetters: [string, string, string] = [
      String(result.coverLetters[0]),
      String(result.coverLetters[1]),
      String(result.coverLetters[2]),
    ];

    // Save to Firestore
    const now = admin.firestore.Timestamp.now();
    const analysisRef = db.collection(`users/${uid}/analyses`).doc();

    await db.runTransaction(async (tx) => {
      tx.set(analysisRef, {
        jobDescription: jobDescription.trim(),
        resumeText: resumeText.trim(),
        score: result.score,
        keywords: result.keywords,
        rewrittenBullets: result.rewrittenBullets,
        coverLetters,
        createdAt: now,
      });
      tx.set(
        profileRef,
        { analysisCount: admin.firestore.FieldValue.increment(1) },
        { merge: true },
      );
    });

    return {
      analysisId: analysisRef.id,
      score: result.score,
      keywords: result.keywords,
      rewrittenBullets: result.rewrittenBullets,
      coverLetters,
    };
  });

// ---------------------------------------------------------------------------
// parseResumePdf
// Callable CF: receives { pdfBase64 }, decodes, runs pdf-parse, returns text.
// Returns { text: null, error: 'scanned_pdf_not_supported' } for scanned PDFs.
// ---------------------------------------------------------------------------
export const parseResumePdf = functions
  .runWith({ memory: '512MB', timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { pdfBase64 } = data as { pdfBase64: string };
    if (!pdfBase64) {
      throw new functions.https.HttpsError('invalid-argument', 'pdfBase64 is required.');
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(pdfBase64, 'base64');
    } catch {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid base64 data.');
    }

    try {
      const parsed = await pdfParse(buffer);
      const text = parsed.text?.trim();

      if (!text || text.length < 50) {
        return { text: null, error: 'scanned_pdf_not_supported' };
      }

      return { text };
    } catch {
      return { text: null, error: 'scanned_pdf_not_supported' };
    }
  });
