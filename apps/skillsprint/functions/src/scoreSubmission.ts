import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';
import type { ChallengeType } from './types';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

const TIMER_LIMIT_SECONDS = 630;

const DETERMINISTIC_TYPES: ChallengeType[] = [
  'fill_in_blank',
  'multiple_choice',
  'code_reading',
];

interface ScoreRequest {
  challengeId: string;
  answer: string | string[];
  startedAt: string; // ISO timestamp from client
}

interface ScoreResponse {
  score: number;
  feedback?: [string, string, string];
  timedOut?: boolean;
  scoredBy?: 'deterministic' | 'llm_pending';
}

interface ChallengeData {
  type: ChallengeType;
  content: {
    correctAnswer?: string;
    correctIndex?: number;
    explanation?: string;
    hint?: string;
  };
}

// --- Pure scoring helpers (exported for unit testing) ---

export function isTimedOut(startedAtISO: string, submittedAtSeconds: number): boolean {
  const startSeconds = Math.floor(new Date(startedAtISO).getTime() / 1000);
  return submittedAtSeconds - startSeconds > TIMER_LIMIT_SECONDS;
}

export function scoreFillInBlank(
  answer: string | string[],
  correctAnswer: string,
  hint?: string,
): { score: number; feedback: [string, string, string] } {
  const actual = String(Array.isArray(answer) ? answer[0] : answer)
    .trim()
    .toLowerCase();
  const expected = correctAnswer.trim().toLowerCase();

  if (actual === expected) {
    return {
      score: 100,
      feedback: [
        'Correct!',
        `\`${correctAnswer}\` is the right answer.`,
        hint ?? 'Keep practicing to build fluency!',
      ],
    };
  }
  return {
    score: 0,
    feedback: [
      'Incorrect.',
      `The correct answer is \`${correctAnswer}\`.`,
      hint ?? 'Review this concept and try again.',
    ],
  };
}

export function scoreChoice(
  answer: string | string[],
  correctIndex: number,
  explanation?: string,
): { score: number; feedback: [string, string, string] } {
  const selected = Number(Array.isArray(answer) ? answer[0] : answer);

  if (selected === correctIndex) {
    return {
      score: 100,
      feedback: [
        'Correct!',
        explanation ?? 'Great work.',
        'Move on to the next challenge!',
      ],
    };
  }
  return {
    score: 0,
    feedback: [
      'Incorrect.',
      explanation ?? `The correct answer was option ${correctIndex}.`,
      'Review the explanation and try again.',
    ],
  };
}

// --- Cloud Function ---

export const scoreSubmission = onCall<ScoreRequest>(async (request): Promise<ScoreResponse> => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Must be logged in');

  const { challengeId, answer, startedAt: startedAtISO } = request.data;
  if (!challengeId || answer === undefined || !startedAtISO) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  const challengeDoc = await db.collection('challenges').doc(challengeId).get();
  if (!challengeDoc.exists) {
    throw new HttpsError('not-found', 'Challenge not found');
  }
  const challenge = challengeDoc.data() as ChallengeData;

  const submittedAt = Timestamp.now();

  if (isTimedOut(startedAtISO, submittedAt.seconds)) {
    const timedOutFeedback: [string, string, string] = [
      "Time's up!",
      'You exceeded the 10.5-minute limit.',
      'Try again with better pacing.',
    ];
    await writeSubmission(uid, challengeId, {
      answer,
      score: 0,
      feedback: timedOutFeedback,
      submittedAt,
      scoredBy: 'deterministic',
      cohortPercentile: 0,
      timedOut: true,
    });
    await markSprintCompleted(uid);
    return { score: 0, timedOut: true };
  }

  if (DETERMINISTIC_TYPES.includes(challenge.type)) {
    const { content, type } = challenge;
    let result: { score: number; feedback: [string, string, string] };

    if (type === 'fill_in_blank') {
      result = scoreFillInBlank(answer, content.correctAnswer ?? '', content.hint);
    } else {
      // multiple_choice and code_reading both use index-based selection
      result = scoreChoice(answer, content.correctIndex ?? 0, content.explanation);
    }

    await writeSubmission(uid, challengeId, {
      answer,
      score: result.score,
      feedback: result.feedback,
      submittedAt,
      scoredBy: 'deterministic',
      cohortPercentile: 0,
    });
    await markSprintCompleted(uid);
    return {
      score: result.score,
      feedback: result.feedback,
      scoredBy: 'deterministic',
    };
  }

  // Non-deterministic types (writing_prompt, design_critique) — LLM scorer
  // Dispatched via a separate scoreSubmissionLLM function (future task)
  return { score: 0, scoredBy: 'llm_pending' };
});

// --- Firestore helpers ---

async function writeSubmission(
  uid: string,
  challengeId: string,
  data: Record<string, unknown>,
): Promise<void> {
  // Path: submissions/{uid}/challenges/{challengeId} (consistent with scoreSubmissionLLM)
  await db
    .collection('submissions')
    .doc(uid)
    .collection('challenges')
    .doc(challengeId)
    .set(data);
}

async function markSprintCompleted(uid: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const sprintRef = db.doc(`sprints/${uid}/daily/${today}`);
  const userRef = db.doc(`users/${uid}`);
  await Promise.all([
    sprintRef.update({ status: 'completed' }),
    userRef.set({ monthlySprintCount: FieldValue.increment(1) }, { merge: true }),
  ]);
}
