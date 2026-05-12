import type { Group, Session, LineItem, UserProfile } from './types';

export const DEMO_USER_PROFILE: UserProfile = {
  uid: 'demo-uid',
  email: 'demo@splitsnap.app',
  displayName: 'You',
  venmoHandle: 'demo-user',
  cashTag: 'demouser',
  tier: 'free',
  createdAt: new Date('2026-01-01'),
};

export const DEMO_GROUPS: Group[] = [
  {
    id: 'demo-group-1',
    name: 'Weekend Warriors',
    members: ['demo-uid', 'demo-alice', 'demo-bob', 'demo-charlie'],
    memberEmails: {
      'demo-uid': 'demo@splitsnap.app',
      'demo-alice': 'alice@example.com',
      'demo-bob': 'bob@example.com',
      'demo-charlie': 'charlie@example.com',
    },
    memberNames: {
      'demo-uid': 'You',
      'demo-alice': 'Alice',
      'demo-bob': 'Bob',
      'demo-charlie': 'Charlie',
    },
    createdBy: 'demo-uid',
    createdAt: new Date('2026-03-15'),
  },
  {
    id: 'demo-group-2',
    name: 'Roommates',
    members: ['demo-uid', 'demo-dana'],
    memberEmails: {
      'demo-uid': 'demo@splitsnap.app',
      'demo-dana': 'dana@example.com',
    },
    memberNames: {
      'demo-uid': 'You',
      'demo-dana': 'Dana',
    },
    createdBy: 'demo-uid',
    createdAt: new Date('2026-01-10'),
  },
];

export const DEMO_ITEMS: LineItem[] = [
  { id: 'item-1', name: 'Margherita Pizza', price: 2200, claimedBy: 'demo-alice' },
  { id: 'item-2', name: 'Caesar Salad', price: 1400, claimedBy: 'demo-uid' },
  { id: 'item-3', name: 'BBQ Burger', price: 1800, claimedBy: 'demo-bob' },
  { id: 'item-4', name: 'Pasta Carbonara', price: 1600, claimedBy: 'demo-charlie' },
  { id: 'item-5', name: 'Diet Coke x2', price: 1200, claimedBy: 'demo-uid' },
  { id: 'item-6', name: 'Sparkling Water', price: 600, claimedBy: null },
];

export const DEMO_SESSION: Session = {
  id: 'demo-session-1',
  groupId: 'demo-group-1',
  receiptImageUrl: '',
  subtotal: 8800,
  tax: 792,
  tip: 1716,
  status: 'claiming',
  items: DEMO_ITEMS,
  settledBy: [],
  createdAt: new Date(Date.now() - 20 * 60 * 1000),
  createdBy: 'demo-uid',
};

export const DEMO_HISTORY: Session[] = [
  {
    id: 'demo-session-past-1',
    groupId: 'demo-group-1',
    receiptImageUrl: '',
    subtotal: 6400,
    tax: 576,
    tip: 1280,
    status: 'settled',
    items: [
      { id: 'h1-1', name: 'Sushi Platter', price: 3200, claimedBy: 'demo-uid' },
      { id: 'h1-2', name: 'Ramen Bowl', price: 1600, claimedBy: 'demo-alice' },
      { id: 'h1-3', name: 'Miso Soup x2', price: 800, claimedBy: 'demo-bob' },
      { id: 'h1-4', name: 'Edamame', price: 800, claimedBy: 'demo-charlie' },
    ],
    settledBy: ['demo-uid', 'demo-alice', 'demo-bob', 'demo-charlie'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdBy: 'demo-alice',
  },
  {
    id: 'demo-session-past-2',
    groupId: 'demo-group-1',
    receiptImageUrl: '',
    subtotal: 4200,
    tax: 378,
    tip: 840,
    status: 'settled',
    items: [
      { id: 'h2-1', name: 'Tacos x3', price: 2100, claimedBy: 'demo-bob' },
      { id: 'h2-2', name: 'Guacamole', price: 900, claimedBy: 'demo-charlie' },
      { id: 'h2-3', name: 'Margaritas x2', price: 1200, claimedBy: 'demo-uid' },
    ],
    settledBy: ['demo-uid', 'demo-bob', 'demo-charlie'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    createdBy: 'demo-uid',
  },
  {
    id: 'demo-session-past-3',
    groupId: 'demo-group-2',
    receiptImageUrl: '',
    subtotal: 3200,
    tax: 288,
    tip: 480,
    status: 'settled',
    items: [
      { id: 'h3-1', name: 'Groceries — Produce', price: 1800, claimedBy: 'demo-uid' },
      { id: 'h3-2', name: 'Household Supplies', price: 1400, claimedBy: 'demo-dana' },
    ],
    settledBy: ['demo-uid', 'demo-dana'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdBy: 'demo-uid',
  },
];

export const DEMO_OCR_ITEMS: LineItem[] = [
  { id: 'ocr-1', name: 'Margherita Pizza', price: 2200, claimedBy: null },
  { id: 'ocr-2', name: 'Caesar Salad', price: 1400, claimedBy: null },
  { id: 'ocr-3', name: 'BBQ Burger', price: 1800, claimedBy: null },
  { id: 'ocr-4', name: 'Pasta Carbonara', price: 1600, claimedBy: null },
  { id: 'ocr-5', name: 'Diet Coke x2', price: 1200, claimedBy: null },
  { id: 'ocr-6', name: 'Sparkling Water', price: 600, claimedBy: null },
];
