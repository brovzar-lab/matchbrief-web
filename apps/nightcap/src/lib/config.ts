export const isDemoMode =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'true' ||
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

export const RC_MONTHLY_ID = 'nightcap_premium_monthly_799';
export const RC_ANNUAL_ID = 'nightcap_premium_annual_5999';
export const RC_ENTITLEMENT_ID = 'premium';

// Theme — deep-blue-to-purple gradient, dark mode primary
export const BG = '#0B0A1E';
export const CARD = '#141228';
export const BORDER = '#2A2650';
export const TEXT = '#F0EEFF';
export const SUBTEXT = '#8B87B8';
export const ACCENT = '#7C6FF7';
export const ACCENT_LIGHT = '#A78BFA';
export const GRAD_START = '#0B0A1E';
export const GRAD_END = '#1F0A3C';
export const SUCCESS = '#22C55E';
export const DANGER = '#EF4444';
export const WARNING = '#F59E0B';

export const DIM_COLORS = {
  energy: '#F59E0B',
  mood: '#EC4899',
  focus: '#7C6FF7',
  social: '#22C55E',
  output: '#06B6D4',
} as const;

export type Dimension = keyof typeof DIM_COLORS;

export const DIMENSIONS: Dimension[] = ['energy', 'mood', 'focus', 'social', 'output'];
