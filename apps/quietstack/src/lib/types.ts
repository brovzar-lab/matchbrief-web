export type UserTier = 'free' | 'pro';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemo: boolean;
};

export type SynthesisSource = 'url' | 'pdf';

export type Synthesis = {
  id: string;
  sourceType: SynthesisSource;
  sourceUrl?: string;
  pdfName?: string;
  title: string;
  summary: string;
  keyInsights: string[];
  actionItems: string[];
  tags: string[];
  createdAt: Date;
};

export type MonthlyUsage = {
  count: number;
  month: string;
};

export type UserProfile = {
  uid: string;
  tier: UserTier;
  createdAt: Date;
};

export type SynthesizeUrlRequest = {
  url: string;
};

export type SynthesizePdfRequest = {
  storagePath: string;
  fileName: string;
};

export type SynthesisResult = {
  synthesisId: string;
  title: string;
  summary: string;
  keyInsights: string[];
  actionItems: string[];
  tags: string[];
};

export type RateLimitInfo = {
  used: number;
  limit: number;
  tier: UserTier;
};
