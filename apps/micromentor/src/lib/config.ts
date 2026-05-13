export const isDemoMode =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'true' ||
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'REPLACE_WITH_VALUE';

export const RC_MONTHLY_ID = 'micromentor_premium_monthly_1499';
export const RC_ANNUAL_ID = 'micromentor_premium_annual_9900';
export const RC_ENTITLEMENT_ID = 'premium';

// Theme — deep navy + amber (dark-mode)
export const BG = '#0A1628';
export const BG_SECONDARY = '#0F1E35';
export const CARD = '#162240';
export const BORDER = '#1E3050';
export const TEXT = '#FFFFFF';
export const SUBTEXT = '#94A3B8';
export const ACCENT = '#F59E0B';
export const ACCENT_LIGHT = '#FCD34D';
export const ACCENT_DIM = 'rgba(245, 158, 11, 0.15)';
export const SUCCESS = '#10B981';
export const DANGER = '#EF4444';
export const MUTED = '#475569';

export const ONBOARDING_QUESTIONS: Array<{ key: string; question: string; placeholder: string }> = [
  {
    key: 'current_role',
    question: 'What is your current role?',
    placeholder: 'e.g. Engineering Manager, Senior Product Manager…',
  },
  {
    key: 'team_size',
    question: 'How large is your team or direct sphere of influence?',
    placeholder: 'e.g. Just me, 3-5 people, 10+ people…',
  },
  {
    key: 'biggest_challenge',
    question: 'What is your biggest professional challenge right now?',
    placeholder: 'e.g. Managing up, difficult conversations, prioritization…',
  },
  {
    key: 'recent_win',
    question: 'What is a recent professional win you are proud of?',
    placeholder: 'Tell us something that went well…',
  },
  {
    key: 'communication_style',
    question: 'How would you describe your communication style?',
    placeholder: 'e.g. Direct and brief, collaborative, prefer writing over calls…',
  },
  {
    key: 'learning_goal',
    question: 'What is one leadership or career skill you want to develop most?',
    placeholder: 'e.g. Giving better feedback, executive presence, strategic thinking…',
  },
  {
    key: 'time_available',
    question: 'How much time can you realistically dedicate to coaching each day?',
    placeholder: 'e.g. 5 minutes, 10-15 minutes, 30 minutes…',
  },
  {
    key: 'manager_relationship',
    question: 'How would you describe your relationship with your manager (or board/stakeholders)?',
    placeholder: 'e.g. Strong advocate, hands-off, need more visibility…',
  },
  {
    key: 'career_goal_12mo',
    question: 'Where do you want to be in your career in 12 months?',
    placeholder: 'e.g. Promoted to Director, lead a larger org, move into a new function…',
  },
  {
    key: 'coaching_style_pref',
    question: 'What coaching style works best for you?',
    placeholder: 'e.g. Challenging questions, concrete frameworks, accountability partner…',
  },
];
