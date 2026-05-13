import {
  UserProfile,
  Product,
  Routine,
  RoutineEntry,
  SkinCheck,
  ProductRating,
  ProductEfficacy,
} from '../lib/types';

function iso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
}

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export const DEMO_USER: UserProfile = {
  uid: 'demo-user-001',
  displayName: 'Sophie Chen',
  email: 'sophie@demo.glowlog',
  createdAt: iso(60),
  streakDays: 28,
  lastCheckInDate: dateStr(0),
  isPremium: false,
};

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Vitamin C Brightening Serum',
    brand: 'The Ordinary',
    photoUrl: null,
    category: 'Serum',
    addedAt: iso(60),
    isActive: true,
  },
  {
    id: 'prod-002',
    name: 'SPF 50 Daily Moisturizer',
    brand: 'CeraVe',
    photoUrl: null,
    category: 'Sunscreen',
    addedAt: iso(60),
    isActive: true,
  },
  {
    id: 'prod-003',
    name: 'Retinol 0.5% in Squalane',
    brand: 'The Ordinary',
    photoUrl: null,
    category: 'Treatment',
    addedAt: iso(55),
    isActive: true,
  },
  {
    id: 'prod-004',
    name: 'Gentle Foaming Cleanser',
    brand: 'La Roche-Posay',
    photoUrl: null,
    category: 'Cleanser',
    addedAt: iso(50),
    isActive: true,
  },
  {
    id: 'prod-005',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    photoUrl: null,
    category: 'Serum',
    addedAt: iso(45),
    isActive: true,
  },
  {
    id: 'prod-006',
    name: 'Hydrating Toner',
    brand: 'Klairs',
    photoUrl: null,
    category: 'Toner',
    addedAt: iso(40),
    isActive: true,
  },
];

// ---------------------------------------------------------------------------
// Routines
// ---------------------------------------------------------------------------

export const DEMO_MORNING_ROUTINE: Routine = {
  id: 'routine-morning',
  type: 'morning',
  productIds: ['prod-004', 'prod-006', 'prod-001', 'prod-002'],
  updatedAt: iso(30),
};

export const DEMO_NIGHT_ROUTINE: Routine = {
  id: 'routine-night',
  type: 'night',
  productIds: ['prod-004', 'prod-006', 'prod-005', 'prod-003'],
  updatedAt: iso(30),
};

// ---------------------------------------------------------------------------
// Routine Entries — 4 weeks of daily completions
// ---------------------------------------------------------------------------

function makeEntry(daysAgo: number, routineId: string, productIds: string[]): RoutineEntry {
  return {
    id: `entry-${routineId}-${daysAgo}`,
    routineId,
    date: dateStr(daysAgo),
    completedProductIds: productIds,
    loggedAt: iso(daysAgo),
  };
}

export const DEMO_ROUTINE_ENTRIES: RoutineEntry[] = Array.from({ length: 28 }, (_, i) => {
  const day = i + 1;
  return [
    makeEntry(day, 'routine-morning', DEMO_MORNING_ROUTINE.productIds),
    makeEntry(day, 'routine-night', DEMO_NIGHT_ROUTINE.productIds),
  ];
}).flat();

// ---------------------------------------------------------------------------
// Skin Checks
// ---------------------------------------------------------------------------

export const DEMO_SKIN_CHECKS: SkinCheck[] = [
  {
    id: 'check-001',
    photoUrl: 'https://placehold.co/400x400/F9E8E8/8B6F72?text=Week+1',
    date: dateStr(28),
    notes: 'Starting out — some redness on cheeks, light texture.',
  },
  {
    id: 'check-002',
    photoUrl: 'https://placehold.co/400x400/F9E8E8/8B6F72?text=Week+2',
    date: dateStr(21),
    notes: 'Feeling more hydrated. Vitamin C seems to be working.',
  },
  {
    id: 'check-003',
    photoUrl: 'https://placehold.co/400x400/F9E8E8/8B6F72?text=Week+3',
    date: dateStr(14),
    notes: 'Retinol adjustment phase — some peeling near nose.',
  },
  {
    id: 'check-004',
    photoUrl: 'https://placehold.co/400x400/F9E8E8/8B6F72?text=Week+4',
    date: dateStr(7),
    notes: 'Skin looking clearer! Texture improvement is real.',
  },
];

// ---------------------------------------------------------------------------
// Product Ratings
// ---------------------------------------------------------------------------

export const DEMO_RATINGS: ProductRating[] = [
  { id: 'rating-001', productId: 'prod-001', stars: 5, ratedAt: iso(28), weeksInUse: 4 },
  { id: 'rating-002', productId: 'prod-001', stars: 4, ratedAt: iso(14), weeksInUse: 6 },
  { id: 'rating-003', productId: 'prod-002', stars: 5, ratedAt: iso(21), weeksInUse: 8 },
  { id: 'rating-004', productId: 'prod-003', stars: 4, ratedAt: iso(7), weeksInUse: 3 },
  { id: 'rating-005', productId: 'prod-004', stars: 5, ratedAt: iso(35), weeksInUse: 10 },
  { id: 'rating-006', productId: 'prod-005', stars: 4, ratedAt: iso(20), weeksInUse: 5 },
  { id: 'rating-007', productId: 'prod-006', stars: 3, ratedAt: iso(15), weeksInUse: 4 },
];

// ---------------------------------------------------------------------------
// Product Efficacy
// ---------------------------------------------------------------------------

export const DEMO_EFFICACY: Record<string, ProductEfficacy> = {
  'prod-001': {
    productId: 'prod-001',
    userId: 'demo-user-001',
    avgStars: 4.5,
    ratingCount: 2,
    updatedAt: iso(14),
  },
  'prod-002': {
    productId: 'prod-002',
    userId: 'demo-user-001',
    avgStars: 5.0,
    ratingCount: 1,
    updatedAt: iso(21),
  },
  'prod-003': {
    productId: 'prod-003',
    userId: 'demo-user-001',
    avgStars: 4.0,
    ratingCount: 1,
    updatedAt: iso(7),
  },
  'prod-004': {
    productId: 'prod-004',
    userId: 'demo-user-001',
    avgStars: 5.0,
    ratingCount: 1,
    updatedAt: iso(35),
  },
  'prod-005': {
    productId: 'prod-005',
    userId: 'demo-user-001',
    avgStars: 4.0,
    ratingCount: 1,
    updatedAt: iso(20),
  },
  'prod-006': {
    productId: 'prod-006',
    userId: 'demo-user-001',
    avgStars: 3.0,
    ratingCount: 1,
    updatedAt: iso(15),
  },
};

// Computed overall skin health score (avg of all efficacy)
export function computeSkinHealthScore(efficacy: Record<string, ProductEfficacy>): number {
  const vals = Object.values(efficacy);
  if (vals.length === 0) return 0;
  const sum = vals.reduce((acc, e) => acc + e.avgStars, 0);
  return Math.round((sum / vals.length) * 10) / 10;
}
