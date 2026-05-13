export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  createdAt: string;
  streakDays: number;
  lastCheckInDate: string | null;
  isPremium: boolean;
}

export type ProductCategory =
  | 'Cleanser'
  | 'Toner'
  | 'Serum'
  | 'Moisturizer'
  | 'Sunscreen'
  | 'Eye Cream'
  | 'Exfoliant'
  | 'Mask'
  | 'Treatment'
  | 'Other';

export interface Product {
  id: string;
  name: string;
  brand: string;
  photoUrl: string | null;
  category: ProductCategory;
  addedAt: string;
  isActive: boolean;
}

export type RoutineType = 'morning' | 'night';

export interface Routine {
  id: string;
  type: RoutineType;
  productIds: string[];
  updatedAt: string;
}

export interface RoutineEntry {
  id: string;
  routineId: string;
  date: string;
  completedProductIds: string[];
  loggedAt: string;
}

export interface ProductRating {
  id: string;
  productId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  ratedAt: string;
  weeksInUse: number;
}

export interface SkinCheck {
  id: string;
  photoUrl: string | null;
  date: string;
  notes: string;
}

export interface ProductEfficacy {
  productId: string;
  userId: string;
  avgStars: number;
  ratingCount: number;
  updatedAt: string;
}
