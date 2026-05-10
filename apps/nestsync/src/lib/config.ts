export const isDemoMode =
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

// RevenueCat product
export const RC_PRODUCT_ID = 'nestsync_monthly_999';

// Theme
export const BG = '#0A1628';
export const CARD = '#0F2040';
export const BORDER = '#1B3558';
export const TEXT = '#F0F4F8';
export const SUBTEXT = '#8BA4C0';
export const ACCENT = '#10B981';
export const ACCENT_LIGHT = '#34D399';
export const DANGER = '#EF4444';
export const SUCCESS = '#10B981';
export const WARNING = '#F59E0B';
