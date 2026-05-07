import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import Anthropic from "@anthropic-ai/sdk";

export interface WritingPromptContent {
  prompt: string;
  scoringCriteria: string[];
  track: string;
}

export interface DesignCritiqueContent {
  designPrompt: string;
  scoringCriteria: string[];
  track: string;
}

// Structural Timestamp compatible with both firebase-admin and test mocks
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface LLMScoringRequest {
  uid: string;
  challengeId: string;
  challengeType: "writing_prompt" | "design_critique";
  content: WritingPromptContent | DesignCritiqueContent;
  answer: string | string[];
  startedAt: Timestamp;
  submittedAt: Timestamp;
}

interface LLMResponse {
  score: number;
  feedback: [string, string, string];
}

const TIMEOUT_SECONDS = 630; // 10 min + 30s grace

const TIMEOUT_FEEDBACK: [string, string, string] = [
  "Time limit exceeded. Please complete the challenge within the 10-minute window.",
  "Practice completing similar challenges to improve your speed before attempting again.",
  "Consider outlining your response first to work more efficiently under time pressure.",
];

const FALLBACK_RESPONSE: LLMResponse = {
  score: 50,
  feedback: [
    "Your submission was received but could not be fully evaluated at this time.",
    "Review the challenge criteria carefully and revise your response with more specific examples.",
    "Focus on addressing each scoring criterion explicitly in your next attempt.",
  ],
};

const DEMO_RESPONSE: LLMResponse = {
  score: 75,
  feedback: [
    "Good overall structure — your response addresses the core prompt effectively.",
    "Add more specific examples to strengthen your argument and demonstrate deeper understanding.",
    "Conclude with a clearer summary that reinforces your key points.",
  ],
};

function buildSystemPrompt(request: LLMScoringRequest): string {
  const track = request.content.track;
  return `You are an expert skills evaluator. Score the following submission for a ${track} challenge.
Return ONLY valid JSON with this exact shape:
{
  "score": <integer 0-100>,
  "feedback": ["<specific note 1>", "<specific note 2>", "<specific note 3>"]
}
Each feedback note must be a specific, actionable improvement suggestion (1-2 sentences).
Do not include any text outside the JSON object.`;
}

function buildUserMessage(request: LLMScoringRequest): string {
  if (request.challengeType === "writing_prompt") {
    const content = request.content as WritingPromptContent;
    const answer = request.answer as string;
    return `Challenge Prompt: ${content.prompt}

Scoring Criteria:
${content.scoringCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

User's Answer:
${answer}`;
  } else {
    const content = request.content as DesignCritiqueContent;
    const fields = Array.isArray(request.answer) ? request.answer : [request.answer];
    return `Design Challenge: ${content.designPrompt}

Scoring Criteria:
${content.scoringCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

User's Critique:
${fields.join("\n\n")}`;
  }
}

function parseClaudeResponse(text: string): LLMResponse | null {
  try {
    const parsed = JSON.parse(text) as { score?: unknown; feedback?: unknown };
    if (
      typeof parsed.score !== "number" ||
      !Array.isArray(parsed.feedback) ||
      parsed.feedback.length !== 3 ||
      !parsed.feedback.every((f: unknown) => typeof f === "string")
    ) {
      return null;
    }
    return {
      score: Math.min(100, Math.max(0, Math.round(parsed.score))),
      feedback: parsed.feedback as [string, string, string],
    };
  } catch {
    return null;
  }
}

async function callClaude(
  client: Anthropic,
  systemPrompt: string,
  userMessage: string,
): Promise<LLMResponse | null> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content[0];
  if (!block || block.type !== "text") return null;
  return parseClaudeResponse(block.text);
}

// Exported for unit testing
export async function _scoreSubmission(request: LLMScoringRequest): Promise<void> {
  const db = admin.firestore();
  // submissions/{uid}/challenges/{challengeId} — valid 4-segment Firestore doc path
  const submissionRef = db.doc(
    `submissions/${request.uid}/challenges/${request.challengeId}`,
  );

  // Timer enforcement must happen before any LLM call
  const elapsedSeconds = request.submittedAt.seconds - request.startedAt.seconds;
  if (elapsedSeconds > TIMEOUT_SECONDS) {
    await submissionRef.set({
      answer: request.answer,
      score: 0,
      feedback: TIMEOUT_FEEDBACK,
      submittedAt: request.submittedAt,
      scoredBy: "llm",
      cohortPercentile: 0,
    });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "REPLACE_WITH_VALUE") {
    await submissionRef.set({
      answer: request.answer,
      ...DEMO_RESPONSE,
      submittedAt: request.submittedAt,
      scoredBy: "llm",
      cohortPercentile: 0,
    });
    return;
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt(request);
  const userMessage = buildUserMessage(request);

  const startMs = Date.now();
  let result: LLMResponse | null = null;

  try {
    result = await callClaude(client, systemPrompt, userMessage);

    if (!result) {
      logger.warn("scoreSubmissionLLM: invalid JSON on first attempt, retrying", {
        uid: request.uid,
        challengeId: request.challengeId,
      });
      result = await callClaude(client, systemPrompt, userMessage);
    }
  } catch (err) {
    logger.error("scoreSubmissionLLM: Anthropic API error", { err });
  }

  logger.info("scoreSubmissionLLM: complete", {
    uid: request.uid,
    challengeId: request.challengeId,
    challengeType: request.challengeType,
    latencyMs: Date.now() - startMs,
    usedFallback: result === null,
  });

  const final = result ?? FALLBACK_RESPONSE;

  await submissionRef.set({
    answer: request.answer,
    score: final.score,
    feedback: final.feedback,
    submittedAt: request.submittedAt,
    scoredBy: "llm",
    cohortPercentile: 0,
  });
}

export const scoreSubmissionLLM = onCall(
  { timeoutSeconds: 120, memory: "512MiB" },
  async (req) => {
    if (!req.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }
    const request = req.data as LLMScoringRequest;
    if (!request.uid || !request.challengeId || !request.challengeType) {
      throw new HttpsError("invalid-argument", "Missing required fields: uid, challengeId, challengeType");
    }
    await _scoreSubmission(request);
    return { ok: true };
  },
);
