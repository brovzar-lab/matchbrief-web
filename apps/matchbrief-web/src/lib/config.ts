export const isDemoMode =
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

export const FREE_ANALYSIS_LIMIT = 3;

export const COVER_LETTER_LABELS: [string, string, string] = [
  'Formal',
  'Conversational',
  'Bold',
];

export const SCORE_COLOR = (score: number): string => {
  if (score >= 75) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
};
