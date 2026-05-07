export type SessionStatus = 'scanning' | 'claiming' | 'splitting' | 'done';

export type Session = {
  id: string;
  hostId: string;
  status: SessionStatus;
  receiptImageUrl: string;
  subtotal: number;
  tax: number;
  tip: number;
  createdAt: Date;
};

export type Item = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  claimedBy: string[];
};

export type Participant = {
  id: string;
  name: string;
  joinedAt: Date;
  venmoHandle: string | null;
  total: number;
  paymentLink: string;
};

export type AuthUser = {
  uid: string;
  isDemo: boolean;
};

export type OcrItem = {
  name: string;
  price: number;
  quantity: number;
};
