import { create } from 'zustand';
import { JournalEntry, PatternCard, UserProfile } from './types';
import { isDemoMode } from './config';
import { DEMO_JOURNALS, DEMO_PATTERNS, DEMO_USER } from '../demo/seed';

interface NightCapState {
  // Auth
  user: UserProfile | null;
  isDemo: boolean;

  // Journal
  journals: Record<string, JournalEntry>; // keyed by YYYY-MM-DD
  patterns: PatternCard[];

  // Recording flow
  pendingTranscript: string;
  pendingTags: string[];

  // Actions
  setUser: (user: UserProfile | null) => void;
  setJournals: (journals: Record<string, JournalEntry>) => void;
  upsertJournal: (entry: JournalEntry) => void;
  setPatterns: (patterns: PatternCard[]) => void;
  setPendingTranscript: (transcript: string, tags: string[]) => void;
  clearPending: () => void;
  signOut: () => void;
}

export const useStore = create<NightCapState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  isDemo: isDemoMode,
  journals: isDemoMode
    ? Object.fromEntries(DEMO_JOURNALS.map((j) => [j.date, j]))
    : {},
  patterns: isDemoMode ? DEMO_PATTERNS : [],
  pendingTranscript: '',
  pendingTags: [],

  setUser: (user) => set({ user }),
  setJournals: (journals) => set({ journals }),
  upsertJournal: (entry) =>
    set((s) => ({ journals: { ...s.journals, [entry.date]: entry } })),
  setPatterns: (patterns) => set({ patterns }),
  setPendingTranscript: (pendingTranscript, pendingTags) =>
    set({ pendingTranscript, pendingTags }),
  clearPending: () => set({ pendingTranscript: '', pendingTags: [] }),
  signOut: () =>
    set({
      user: isDemoMode ? DEMO_USER : null,
      journals: isDemoMode
        ? Object.fromEntries(DEMO_JOURNALS.map((j) => [j.date, j]))
        : {},
      patterns: isDemoMode ? DEMO_PATTERNS : [],
    }),
}));

export function initAuthListener() {
  if (isDemoMode) return () => {};
  // Firebase auth listener wired in APPU-403
  return () => {};
}
