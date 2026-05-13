export const isDemoMode =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'true' ||
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

export const RC_MONTHLY_ID = 'glowlog_monthly';
export const RC_ANNUAL_ID = 'glowlog_annual';
export const RC_ENTITLEMENT_ID = 'glowlog_premium';

// Theme — soft rose / cream / dusty mauve (light mode)
export const BG = '#FDF6F0';
export const BG_SECONDARY = '#F9E8E8';
export const CARD = '#FFFFFF';
export const BORDER = '#E8D5D0';
export const TEXT = '#2D1B1E';
export const SUBTEXT = '#8B6F72';
export const ACCENT = '#C9A4A4';
export const ACCENT_DARK = '#9E7070';
export const ACCENT_DIM = 'rgba(201, 164, 164, 0.2)';
export const SUCCESS = '#84A98C';
export const DANGER = '#E56B6F';
export const MUTED = '#B8A0A3';

export const FREE_SKIN_CHECK_LIMIT = 4;
