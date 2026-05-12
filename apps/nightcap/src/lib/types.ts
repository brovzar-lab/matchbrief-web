export interface Ratings {
  energy: number;
  mood: number;
  focus: number;
  social: number;
  output: number;
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  audioStoragePath?: string;
  transcript: string;
  tags: string[];
  ratings: Ratings;
  createdAt: string;
}

export interface PatternCard {
  id: string;
  title: string;
  body: string;
  generatedAt: string;
  dataRange: { from: string; to: string };
  emoji: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  trialStartDate: string;
  tier: 'free' | 'premium';
}

export type RecordingFlow = {
  step: 'record' | 'rate' | 'review';
  transcript?: string;
  tags?: string[];
  ratings?: Partial<import('./config').Ratings>;
};
