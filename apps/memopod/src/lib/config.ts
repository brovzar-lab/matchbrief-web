export const isDemoMode =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'true' ||
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

export const RC_MONTHLY_ID = 'memopod_premium_monthly_299';
export const RC_ANNUAL_ID = 'memopod_premium_annual_1999';
export const RC_ENTITLEMENT_ID = 'premium';

export const FREE_MEMO_LIMIT = 20;

// Theme — white + electric-blue
export const BG = '#FFFFFF';
export const BG_SECONDARY = '#F8FAFC';
export const CARD = '#F1F5F9';
export const BORDER = '#E2E8F0';
export const TEXT = '#1E293B';
export const SUBTEXT = '#64748B';
export const ACCENT = '#2563EB';
export const ACCENT_LIGHT = '#60A5FA';
export const RECORD_IDLE = '#2563EB';
export const RECORD_ACTIVE = '#EF4444';
export const SUCCESS = '#10B981';
export const DANGER = '#EF4444';
export const WARNING = '#F59E0B';

export type MemoCategory = 'idea' | 'task' | 'reminder' | 'note';

export const CATEGORY_COLORS: Record<MemoCategory, string> = {
  idea: '#8B5CF6',
  task: '#2563EB',
  reminder: '#F59E0B',
  note: '#10B981',
};

export const CATEGORY_LABELS: Record<MemoCategory, string> = {
  idea: 'Idea',
  task: 'Task',
  reminder: 'Reminder',
  note: 'Note',
};

export const CATEGORY_ICONS: Record<MemoCategory, string> = {
  idea: '💡',
  task: '✅',
  reminder: '⏰',
  note: '📝',
};

export const CATEGORIES: MemoCategory[] = ['idea', 'task', 'reminder', 'note'];
