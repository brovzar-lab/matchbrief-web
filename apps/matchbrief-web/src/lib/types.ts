export type KeywordStatus = 'green' | 'yellow' | 'red';

export interface AnalysisKeyword {
  word: string;
  status: KeywordStatus;
}

export interface BulletRewrite {
  original: string;
  rewritten: string;
}

export interface Analysis {
  id: string;
  jobDescription: string;
  resumeText: string;
  score: number;
  keywords: AnalysisKeyword[];
  rewrittenBullets: BulletRewrite[];
  coverLetters: [string, string, string];
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  tier: 'free' | 'pro';
  analysisCount: number;
  analysisResetAt: string;
  createdAt: string;
}
