import { useState } from 'react';
import { isDemoMode } from '../lib/config';

export interface SubmitPayload {
  challengeId: string;
  answer: string | string[];
  startedAt: Date;
}

export interface SubmitResult {
  score: number;
  feedback: [string, string, string];
  scoredBy: 'deterministic' | 'llm';
  cohortPercentile: number;
  timedOut: boolean;
}

export type SubmitState = 'idle' | 'submitting' | 'scoring' | 'done' | 'error';

const DEMO_RESULT: SubmitResult = {
  score: 78,
  feedback: [
    'Good foundational understanding — your answer identifies the key concept.',
    'Include a concrete real-world example to deepen the explanation.',
    'Review related algorithmic patterns to build a stronger mental model.',
  ],
  scoredBy: 'deterministic',
  cohortPercentile: 64,
  timedOut: false,
};

const TIMEOUT_MS = 15_000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toTimestamp(date: Date): { seconds: number; nanoseconds: number } {
  return { seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 };
}

export function useSubmitChallenge() {
  const [state, setState] = useState<SubmitState>('idle');
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: SubmitPayload): Promise<SubmitResult | null> {
    if (state === 'submitting' || state === 'scoring') return null;
    setState('submitting');
    setError(null);

    if (isDemoMode) {
      setState('scoring');
      await delay(600);
      setResult(DEMO_RESULT);
      setState('done');
      return DEMO_RESULT;
    }

    setState('scoring');
    try {
      const baseUrl = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL ?? '';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(`${baseUrl}/scoreSubmission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            challengeId: payload.challengeId,
            answer: payload.answer,
            startedAt: toTimestamp(payload.startedAt),
            submittedAt: toTimestamp(new Date()),
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = (await res.json()) as { result: SubmitResult };
      const r = json.result;
      setResult(r);
      setState('done');
      return r;
    } catch (err) {
      const timedOut = err instanceof Error && err.name === 'AbortError';
      setError(timedOut ? 'Scoring timed out. Please retry.' : 'Scoring failed. Please retry.');
      setState('error');
      return null;
    }
  }

  function reset() {
    setState('idle');
    setResult(null);
    setError(null);
  }

  return { state, result, error, submit, reset };
}
