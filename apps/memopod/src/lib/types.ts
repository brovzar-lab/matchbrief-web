import type { MemoCategory } from './config';

export interface Memo {
  id: string;
  text: string;
  category: MemoCategory;
  createdAt: string; // ISO string
  durationSec: number;
  extractedDate: string | null; // ISO string, reminders only
  isPremium: boolean;
}

export interface WeeklySummary {
  counts: Record<MemoCategory, number>;
  total: number;
  conversionRate: number; // % of reminders/tasks that had extractedDate
  generatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  createdAt: string;
  memoCountThisMonth: number;
  isPremium: boolean;
}

export type RecordingState = 'idle' | 'recording' | 'transcribing' | 'classified';
