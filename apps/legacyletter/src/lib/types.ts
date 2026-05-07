import type { TierId } from './config';

export type LegacyType = 'text' | 'voice' | 'video';
export type LegacyStatus = 'draft' | 'scheduled' | 'delivered';

export interface Recipient {
  id: string;
  name: string;
  email: string;
}

export interface Legacy {
  id: string;
  type: LegacyType;
  title: string;
  content: string;
  storageRef?: string;
  deliveryDate: Date | null;
  recipients: Recipient[];
  status: LegacyStatus;
  createdAt: Date;
  durationSeconds?: number;
}

export interface UserSubscription {
  tier: TierId;
  expiresAt: Date | null;
  revenueCatId: string | null;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  subscription: UserSubscription;
}
