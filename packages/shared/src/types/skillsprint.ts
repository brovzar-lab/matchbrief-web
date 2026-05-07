export type ChallengeTrack = "coding" | "design" | "writing" | "critical_thinking";
export type ChallengeType =
  | "fill_in_blank"
  | "multiple_choice"
  | "code_reading"
  | "writing_prompt"
  | "design_critique";
export type Difficulty = "easy" | "medium" | "hard";

export interface FillInBlankContent {
  codeSnippet: string;
  language: string;
  correctAnswer: string;
  hint?: string;
}

export interface MultipleChoiceContent {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface CodeReadingContent {
  codeSnippet: string;
  language: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface WritingPromptContent {
  prompt: string;
  context?: string;
  minWords: number;
  scoringCriteria: string[];
}

export interface DesignCritiqueContent {
  screenshotUrl: string;
  context: string;
  critiqueFields: { label: string; placeholder: string }[];
  scoringCriteria: string[];
}

export type ChallengeContent =
  | FillInBlankContent
  | MultipleChoiceContent
  | CodeReadingContent
  | WritingPromptContent
  | DesignCritiqueContent;

export interface Challenge {
  id: string;
  track: ChallengeTrack;
  type: ChallengeType;
  difficulty: Difficulty;
  content: ChallengeContent;
  estimatedMinutes: number;
  tags: string[];
  createdAt: Date;
}

export interface DailySprint {
  challengeId: string;
  assignedAt: Date;
  status: "pending" | "in_progress" | "completed" | "skipped";
  startedAt?: Date;
  completedAt?: Date;
}

export interface Submission {
  answer: string | string[];
  score: number;
  feedback: [string, string, string];
  submittedAt: Date;
  scoredBy: "deterministic" | "llm";
  cohortPercentile: number;
}
