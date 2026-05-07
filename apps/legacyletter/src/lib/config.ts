export const isDemoMode =
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

// Freemium limits
export const FREE_LEGACY_LIMIT = 3;

export const TIERS = {
  free: { id: 'free', label: 'Free', price: 0 },
  pro_monthly: { id: 'pro_monthly', label: 'Pro Monthly', price: 4.99 },
  vault_monthly: { id: 'vault_monthly', label: 'Vault Monthly', price: 9.99 },
  lifetime: { id: 'lifetime', label: 'Lifetime', price: 79 },
} as const;

export type TierId = keyof typeof TIERS;

// Theme
export const BG = '#0D1117';
export const CARD = '#161B22';
export const BORDER = '#30363D';
export const TEXT = '#E6EDF3';
export const SUBTEXT = '#8B949E';
export const ACCENT = '#C9934C';
export const ACCENT_LIGHT = '#F0C070';
export const SUCCESS = '#3FB950';
export const DANGER = '#F85149';
export const WARNING = '#D29922';
