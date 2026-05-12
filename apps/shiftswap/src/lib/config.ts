export const isDemoMode =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'true' ||
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

export const RC_PRODUCT_ID = 'shiftswap_location_monthly_4999';

// Theme
export const BG = '#0B1829';
export const CARD = '#0F2240';
export const BORDER = '#1A3557';
export const TEXT = '#F0F6FF';
export const SUBTEXT = '#7FA3C8';
export const ACCENT = '#0EA5E9';
export const ACCENT_LIGHT = '#38BDF8';
export const DANGER = '#EF4444';
export const SUCCESS = '#22C55E';
export const WARNING = '#F59E0B';
export const WARN_BG = '#2D1B00';
