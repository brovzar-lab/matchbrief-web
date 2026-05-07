import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSet = vi.fn().mockResolvedValue(undefined);
const mockDoc = vi.fn(() => ({ set: mockSet }));

vi.mock("firebase-admin", () => ({
  firestore: vi.fn(() => ({ doc: mockDoc })),
}));

vi.mock("firebase-functions/v2/https", () => ({
  onCall: vi.fn((_opts: unknown, handler: unknown) => handler),
  HttpsError: class HttpsError extends Error {
    constructor(
      public code: string,
      message: string,
    ) {
      super(message);
    }
  },
}));

vi.mock("firebase-functions/logger", () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(() => ({
    messages: { create: mockCreate },
  })),
}));

import { _scoreSubmission } from "../scoreSubmissionLLM";
import type { LLMScoringRequest } from "../scoreSubmissionLLM";

function makeTimestamp(seconds: number) {
  return { seconds, nanoseconds: 0 };
}

function makeRequest(overrides: Partial<LLMScoringRequest> = {}): LLMScoringRequest {
  return {
    uid: "user123",
    challengeId: "challenge456",
    challengeType: "writing_prompt",
    content: {
      prompt: "Write a persuasive essay on renewable energy.",
      scoringCriteria: ["Clarity", "Evidence", "Structure"],
      track: "writing",
    },
    answer: "Renewable energy is the future because...",
    startedAt: makeTimestamp(1000),
    submittedAt: makeTimestamp(1300),
    ...overrides,
  } as LLMScoringRequest;
}

function validLLMResponse(score = 82, notes = ["Note 1", "Note 2", "Note 3"]) {
  return {
    content: [{ type: "text", text: JSON.stringify({ score, feedback: notes }) }],
  };
}

describe("_scoreSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-api-key";
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("writes valid score and feedback on successful LLM response", async () => {
    mockCreate.mockResolvedValueOnce(validLLMResponse(82));

    await _scoreSubmission(makeRequest());

    expect(mockSet).toHaveBeenCalledOnce();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 82,
        feedback: ["Note 1", "Note 2", "Note 3"],
        scoredBy: "llm",
        cohortPercentile: 0,
      }),
    );
  });

  it("retries once on invalid JSON and falls back to score 50 when both fail", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "not valid json at all" }],
    });

    await _scoreSubmission(makeRequest());

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 50,
        scoredBy: "llm",
      }),
    );
  });

  it("uses retry result when second attempt returns valid JSON", async () => {
    mockCreate
      .mockResolvedValueOnce({ content: [{ type: "text", text: "garbage" }] })
      .mockResolvedValueOnce(validLLMResponse(65, ["A", "B", "C"]));

    await _scoreSubmission(makeRequest());

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ score: 65, feedback: ["A", "B", "C"] }),
    );
  });

  it("falls back when LLM response has wrong feedback length", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({ score: 80, feedback: ["only one note"] }),
        },
      ],
    });

    await _scoreSubmission(makeRequest());

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ score: 50 }),
    );
  });

  it("writes score 0 and time-exceeded feedback when timer is violated", async () => {
    const request = makeRequest({
      startedAt: makeTimestamp(1000),
      submittedAt: makeTimestamp(1000 + 631), // 631s > 630s grace
    });

    await _scoreSubmission(request);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 0,
        feedback: expect.arrayContaining([
          expect.stringContaining("Time limit exceeded"),
        ]),
        scoredBy: "llm",
        cohortPercentile: 0,
      }),
    );
  });

  it("accepts submission at exactly the grace boundary (630s)", async () => {
    mockCreate.mockResolvedValueOnce(validLLMResponse(70));

    const request = makeRequest({
      startedAt: makeTimestamp(1000),
      submittedAt: makeTimestamp(1000 + 630), // exactly at limit — should pass
    });

    await _scoreSubmission(request);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ score: 70 }),
    );
  });

  it("writes demo mock score when ANTHROPIC_API_KEY is absent", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    await _scoreSubmission(makeRequest());

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 75,
        scoredBy: "llm",
      }),
    );
  });

  it("handles design_critique type with array answer", async () => {
    mockCreate.mockResolvedValueOnce(validLLMResponse(70, ["Good critique", "Be more specific", "Great analysis"]));

    const request = makeRequest({
      challengeType: "design_critique",
      content: {
        designPrompt: "Critique this login screen for usability.",
        scoringCriteria: ["Usability", "Accessibility", "Visual hierarchy"],
        track: "design",
      },
      answer: ["The CTA button lacks contrast", "Navigation is confusing and lacks hierarchy"],
    });

    await _scoreSubmission(request);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 70,
        answer: ["The CTA button lacks contrast", "Navigation is confusing and lacks hierarchy"],
        scoredBy: "llm",
      }),
    );
  });

  it("clamps score to 0-100 range", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        { type: "text", text: JSON.stringify({ score: 150, feedback: ["A", "B", "C"] }) },
      ],
    });

    await _scoreSubmission(makeRequest());

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ score: 100 }),
    );
  });

  it("falls back gracefully when Anthropic API throws", async () => {
    mockCreate.mockRejectedValue(new Error("network error"));

    await _scoreSubmission(makeRequest());

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ score: 50, scoredBy: "llm" }),
    );
  });
});
