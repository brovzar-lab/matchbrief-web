import { create } from 'zustand';
import type { TrackId } from './config';

interface SkillSprintStore {
  track: TrackId;
  toastMessage: string | null;
  setTrack: (track: TrackId) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useStore = create<SkillSprintStore>()((set) => ({
  track: 'coding',
  toastMessage: null,
  setTrack: (track) => set({ track }),
  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),
}));
