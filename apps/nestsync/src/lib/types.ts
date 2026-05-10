export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface Household {
  id: string;
  parent1Uid: string;
  parent2Uid: string | null;
  subscriptionActive: boolean;
  revenueCatCustomerId: string | null;
  inviteCode: string;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  createdBy: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  sentAt: Date;
  readBy: string[];
}

export type SplitType = 'equal' | 'parent1' | 'parent2';
export type ExpenseStatus = 'unsettled' | 'settled';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  splitType: SplitType;
  status: ExpenseStatus;
  settledAt: Date | null;
  createdAt: Date;
}
