export type DimensionKey =
  | 'leadership'
  | 'communication'
  | 'strategy'
  | 'execution'
  | 'influence'
  | 'selfAwareness';

export interface CareerDimensions {
  leadership: number;
  communication: number;
  strategy: number;
  execution: number;
  influence: number;
  selfAwareness: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  createdAt: string;
  currentStreak: number;
  lastSessionDate: string | null;
  dimensions: CareerDimensions;
  onboardingComplete: boolean;
  isPremium: boolean;
}

export type StepType = 'scenario' | 'reflection' | 'micro_lesson';
export type ResponseFormat = 'text' | 'choice';

export interface SessionStep {
  type: StepType;
  promptText: string;
  responseFormat: ResponseFormat;
  choices?: string[];
}

export interface Session {
  id: string;
  date: string;
  title: string;
  content: SessionStep[];
  rating: number | null;
  resonatedText: string | null;
  completedAt: string | null;
}

export interface OnboardingAnswer {
  questionKey: string;
  answer: string;
}
