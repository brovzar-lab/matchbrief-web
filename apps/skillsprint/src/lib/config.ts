export const isDemoMode =
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

export const SPRINT_LIMIT_FREE = 3;

export const TRACKS = {
  coding: { label: 'Coding', accent: '#3B82F6', emoji: '💻' },
  writing: { label: 'Writing', accent: '#F87171', emoji: '✍️' },
  design: { label: 'Design', accent: '#8B5CF6', emoji: '🎨' },
  critical_thinking: { label: 'Critical Thinking', accent: '#F59E0B', emoji: '🧠' },
} as const;

export type TrackId = keyof typeof TRACKS;

export const BG = '#0F0F13';
export const CARD = '#1A1A2E';
export const BORDER = '#252540';
export const TEXT = '#FFFFFF';
export const SUBTEXT = '#8888AA';
