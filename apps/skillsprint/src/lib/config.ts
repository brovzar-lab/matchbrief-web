export const isDemoMode =
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

export const SPRINT_LIMIT_FREE = 3;

export const TRACKS = {
  coding: { label: 'Coding', accent: '#00C8FF', emoji: '💻' },
  design: { label: 'Design', accent: '#FF6B9D', emoji: '🎨' },
  marketing: { label: 'Marketing', accent: '#FFB347', emoji: '📣' },
  leadership: { label: 'Leadership', accent: '#A78BFA', emoji: '🏆' },
} as const;

export type TrackId = keyof typeof TRACKS;

export const BG = '#0F0F13';
export const CARD = '#1A1A2E';
export const BORDER = '#252540';
export const TEXT = '#FFFFFF';
export const SUBTEXT = '#8888AA';
