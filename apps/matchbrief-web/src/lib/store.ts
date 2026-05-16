import { create } from 'zustand';
import type { Analysis, UserProfile } from './types';
import { isDemoMode } from './config';
import { DEMO_USER, DEMO_ANALYSES } from '../demo/seed';

type AnalyzeStatus = 'idle' | 'loading' | 'error';

interface MatchBriefState {
  user: UserProfile | null;
  analyses: Analysis[];
  currentAnalysis: Analysis | null;
  analyzeStatus: AnalyzeStatus;
  analyzeStep: string;
  analyzeError: string | null;

  setUser: (user: UserProfile | null) => void;
  setAnalyses: (analyses: Analysis[]) => void;
  prependAnalysis: (analysis: Analysis) => void;
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  setAnalyzeStatus: (status: AnalyzeStatus) => void;
  setAnalyzeStep: (step: string) => void;
  setAnalyzeError: (error: string | null) => void;
  signOut: () => void;
}

export const useStore = create<MatchBriefState>((set) => ({
  user: isDemoMode ? DEMO_USER : null,
  analyses: isDemoMode ? DEMO_ANALYSES : [],
  currentAnalysis: isDemoMode ? DEMO_ANALYSES[0] : null,
  analyzeStatus: 'idle',
  analyzeStep: '',
  analyzeError: null,

  setUser: (user) => set({ user }),
  setAnalyses: (analyses) => set({ analyses }),
  prependAnalysis: (analysis) =>
    set((s) => ({ analyses: [analysis, ...s.analyses] })),
  setCurrentAnalysis: (currentAnalysis) => set({ currentAnalysis }),
  setAnalyzeStatus: (analyzeStatus) => set({ analyzeStatus }),
  setAnalyzeStep: (analyzeStep) => set({ analyzeStep }),
  setAnalyzeError: (analyzeError) => set({ analyzeError }),
  signOut: () =>
    set({
      user: isDemoMode ? DEMO_USER : null,
      analyses: isDemoMode ? DEMO_ANALYSES : [],
      currentAnalysis: isDemoMode ? DEMO_ANALYSES[0] : null,
    }),
}));
