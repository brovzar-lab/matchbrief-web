export type UserTier = 'free' | 'pro';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemo: boolean;
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  venmoHandle: string | null;
  cashTag: string | null;
  tier: UserTier;
  createdAt: Date;
};

export type Group = {
  id: string;
  name: string;
  members: string[];
  memberEmails: Record<string, string>;
  memberNames: Record<string, string>;
  createdBy: string;
  createdAt: Date;
};

export type SessionStatus = 'scanning' | 'editing' | 'claiming' | 'settled';

export type LineItem = {
  id: string;
  name: string;
  price: number;
  claimedBy: string | null;
};

export type Session = {
  id: string;
  groupId: string;
  receiptImageUrl: string;
  subtotal: number;
  tax: number;
  tip: number;
  status: SessionStatus;
  items: LineItem[];
  settledBy: string[];
  createdAt: Date;
  createdBy: string;
};

export type OcrItem = {
  name: string;
  price: number;
};
