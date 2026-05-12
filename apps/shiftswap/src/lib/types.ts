export type ShiftRole = string;
export type SwapStatus = 'open' | 'claimed' | 'approved' | 'denied';
export type UserRole = 'manager' | 'worker';

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  companyId: string;
  locationId: string;
  role: UserRole;
  fcmToken?: string;
}

export interface Location {
  id: string;
  name: string;
  overtimeThresholdHours: number;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  role: ShiftRole;
  fcmToken?: string;
  weeklyHoursLimit: number;
}

export interface Shift {
  id: string;
  workerId: string;
  start: Date;
  end: Date;
  role: ShiftRole;
  overtimeRisk: boolean;
}

export interface SwapHistoryEntry {
  action: string;
  agentId: string;
  at: Date;
}

export interface SwapRequest {
  id: string;
  shiftId: string;
  requesterId: string;
  claimantId: string | null;
  status: SwapStatus;
  overtimeWarning: boolean;
  createdAt: Date;
  resolvedAt: Date | null;
  history: SwapHistoryEntry[];
}
