import type { AppUser, Household, CalendarEvent, Message, Expense } from './types';

export const DEMO_USER: AppUser = {
  uid: 'demo-parent1-uid',
  email: 'alex@nestsync.app',
  displayName: 'Alex Rivera',
  photoURL: null,
};

export const DEMO_CO_PARENT_UID = 'demo-parent2-uid';
export const DEMO_CO_PARENT_NAME = 'Jordan Rivera';

export const DEMO_HOUSEHOLD: Household = {
  id: 'demo-household-id',
  parent1Uid: 'demo-parent1-uid',
  parent2Uid: 'demo-parent2-uid',
  subscriptionActive: true,
  revenueCatCustomerId: 'demo-rc-customer',
  inviteCode: '482931',
  createdAt: new Date('2025-01-15'),
};

const now = new Date();
const today = now.toISOString().slice(0, 10);

function daysFromNow(n: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d;
}

export const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: "Emma's Soccer Game",
    startDate: daysFromNow(2),
    endDate: daysFromNow(2),
    allDay: true,
    createdBy: 'demo-parent1-uid',
  },
  {
    id: 'e2',
    title: "Pediatrician — Liam",
    startDate: daysFromNow(5),
    endDate: daysFromNow(5),
    allDay: false,
    createdBy: 'demo-parent2-uid',
  },
  {
    id: 'e3',
    title: "Spring Break w/ Dad",
    startDate: daysFromNow(10),
    endDate: daysFromNow(17),
    allDay: true,
    createdBy: 'demo-parent2-uid',
  },
  {
    id: 'e4',
    title: "School Play — Emma",
    startDate: daysFromNow(3),
    endDate: daysFromNow(3),
    allDay: false,
    createdBy: 'demo-parent1-uid',
  },
  {
    id: 'e5',
    title: "Liam's Birthday Party",
    startDate: daysFromNow(14),
    endDate: daysFromNow(14),
    allDay: true,
    createdBy: 'demo-parent1-uid',
  },
];

export const DEMO_MESSAGES: Message[] = [
  {
    id: 'm1',
    text: "Hi! Can you drop the kids off at 5pm Friday instead of 4? I have a work call.",
    senderId: 'demo-parent2-uid',
    sentAt: new Date(now.getTime() - 60 * 60 * 1000),
    readBy: ['demo-parent1-uid', 'demo-parent2-uid'],
  },
  {
    id: 'm2',
    text: "Sure, no problem. I'll pick them up from school and bring them by at 5.",
    senderId: 'demo-parent1-uid',
    sentAt: new Date(now.getTime() - 55 * 60 * 1000),
    readBy: ['demo-parent1-uid', 'demo-parent2-uid'],
  },
  {
    id: 'm3',
    text: "Thanks! Also, Emma needs her shin guards for the game on Wednesday.",
    senderId: 'demo-parent2-uid',
    sentAt: new Date(now.getTime() - 30 * 60 * 1000),
    readBy: ['demo-parent1-uid', 'demo-parent2-uid'],
  },
  {
    id: 'm4',
    text: "Got it, they're in her sports bag. I'll make sure she has everything.",
    senderId: 'demo-parent1-uid',
    sentAt: new Date(now.getTime() - 10 * 60 * 1000),
    readBy: ['demo-parent1-uid'],
  },
];

export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'x1',
    title: "School supplies — back to school",
    amount: 87.50,
    paidBy: 'demo-parent1-uid',
    splitType: 'equal',
    status: 'settled',
    settledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'x2',
    title: "Soccer registration — Emma",
    amount: 150.00,
    paidBy: 'demo-parent2-uid',
    splitType: 'equal',
    status: 'unsettled',
    settledAt: null,
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'x3',
    title: "Pediatrician co-pay",
    amount: 45.00,
    paidBy: 'demo-parent1-uid',
    splitType: 'equal',
    status: 'unsettled',
    settledAt: null,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'x4',
    title: "Liam's birthday party supplies",
    amount: 65.00,
    paidBy: 'demo-parent2-uid',
    splitType: 'equal',
    status: 'unsettled',
    settledAt: null,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
];

export { today };
