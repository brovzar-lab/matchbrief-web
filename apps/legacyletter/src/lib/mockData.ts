import type { Legacy, AppUser, Recipient } from './types';

export const DEMO_USER: AppUser = {
  uid: 'demo-uid',
  email: 'demo@legacyletter.app',
  displayName: 'Alex Rivera',
  photoURL: null,
  subscription: {
    tier: 'vault_monthly',
    expiresAt: new Date('2027-01-01'),
    revenueCatId: 'demo-revenuecat-id',
  },
};

export const DEMO_RECIPIENTS: Recipient[] = [
  { id: 'r1', name: 'Jordan Rivera', email: 'jordan@example.com' },
  { id: 'r2', name: 'Morgan Rivera', email: 'morgan@example.com' },
  { id: 'r3', name: 'Sam Chen', email: 'sam.chen@example.com' },
];

const now = new Date();
const oneYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
const twoYears = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

export const DEMO_LEGACIES: Legacy[] = [
  {
    id: 'l1',
    type: 'text',
    title: 'To my children, when I'm gone',
    content:
      'My dearest ones,\n\nIf you are reading this, I want you to know how deeply proud I am of each of you. The love I have for you has no measure, no boundary, no end.\n\nLive fully. Love deeply. Be kind — especially to yourselves.\n\nAll my love,\nAlex',
    deliveryDate: oneYear,
    recipients: [DEMO_RECIPIENTS[0], DEMO_RECIPIENTS[1]],
    status: 'scheduled',
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'l2',
    type: 'voice',
    title: 'A song for Jordan',
    content: '',
    storageRef: 'demo/voice/jordan-song.m4a',
    durationSeconds: 187,
    deliveryDate: twoYears,
    recipients: [DEMO_RECIPIENTS[0]],
    status: 'scheduled',
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'l3',
    type: 'video',
    title: 'Family memories — the cabin trip',
    content: '',
    storageRef: 'demo/video/cabin-trip.mp4',
    durationSeconds: 92,
    deliveryDate: null,
    recipients: [],
    status: 'draft',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'l4',
    type: 'text',
    title: 'Advice I wish I had at 25',
    content:
      'Invest in relationships, not things. Say yes to uncomfortable experiences. Call your parents more. Compounding interest works for kindness, too.',
    deliveryDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    recipients: [DEMO_RECIPIENTS[2]],
    status: 'delivered',
    createdAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
  },
];
