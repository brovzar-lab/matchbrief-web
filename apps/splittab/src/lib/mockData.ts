import type { Session, Item, Participant } from './types';

export const DEMO_SESSION_ID = 'demo-session-1';

export const DEMO_SESSION: Session = {
  id: DEMO_SESSION_ID,
  hostId: 'demo-host',
  status: 'claiming',
  receiptImageUrl: '',
  subtotal: 8200,
  tax: 738,
  tip: 1476,
  createdAt: new Date(Date.now() - 15 * 60 * 1000),
};

export const DEMO_ITEMS: Item[] = [
  {
    id: 'item-1',
    name: 'Margherita Pizza',
    price: 2200,
    quantity: 1,
    claimedBy: ['demo-p-alice', 'demo-p-bob'],
  },
  {
    id: 'item-2',
    name: 'Caesar Salad',
    price: 1400,
    quantity: 1,
    claimedBy: ['demo-p-alice'],
  },
  {
    id: 'item-3',
    name: 'BBQ Burger',
    price: 1800,
    quantity: 1,
    claimedBy: ['demo-p-bob'],
  },
  {
    id: 'item-4',
    name: 'Pasta Carbonara',
    price: 1600,
    quantity: 1,
    claimedBy: ['demo-p-charlie'],
  },
  {
    id: 'item-5',
    name: 'Diet Coke',
    price: 600,
    quantity: 2,
    claimedBy: ['demo-p-alice', 'demo-p-charlie'],
  },
  {
    id: 'item-6',
    name: 'Sparkling Water',
    price: 600,
    quantity: 1,
    claimedBy: ['demo-p-bob', 'demo-p-charlie'],
  },
];

export const DEMO_PARTICIPANTS: Participant[] = [
  {
    id: 'demo-p-alice',
    name: 'Alice',
    joinedAt: new Date(Date.now() - 10 * 60 * 1000),
    venmoHandle: 'alice-demo',
    total: 3200,
    paymentLink: 'venmo://paycharge?txn=pay&recipients=alice-demo&amount=32.00&note=SplitTab',
  },
  {
    id: 'demo-p-bob',
    name: 'Bob',
    joinedAt: new Date(Date.now() - 8 * 60 * 1000),
    venmoHandle: 'bob-demo',
    total: 3800,
    paymentLink: 'venmo://paycharge?txn=pay&recipients=bob-demo&amount=38.00&note=SplitTab',
  },
  {
    id: 'demo-p-charlie',
    name: 'Charlie',
    joinedAt: new Date(Date.now() - 5 * 60 * 1000),
    venmoHandle: null,
    total: 2600,
    paymentLink: '',
  },
];

export const DEMO_OCR_ITEMS: Item[] = [
  { id: 'item-1', name: 'Margherita Pizza', price: 2200, quantity: 1, claimedBy: [] },
  { id: 'item-2', name: 'Caesar Salad', price: 1400, quantity: 1, claimedBy: [] },
  { id: 'item-3', name: 'BBQ Burger', price: 1800, quantity: 1, claimedBy: [] },
  { id: 'item-4', name: 'Pasta Carbonara', price: 1600, quantity: 1, claimedBy: [] },
  { id: 'item-5', name: 'Diet Coke', price: 600, quantity: 2, claimedBy: [] },
  { id: 'item-6', name: 'Sparkling Water', price: 600, quantity: 1, claimedBy: [] },
];
