import type { TrackId } from './config';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ChallengeType = 'multiple_choice' | 'text';

export interface Challenge {
  title: string;
  description: string;
  difficulty: Difficulty;
  type: ChallengeType;
}

export interface LeaderEntry {
  rank: number;
  username: string;
  score: number;
  trackId: TrackId;
  isCurrentUser: boolean;
}

export const DEMO_HOME = {
  xp: 1240,
  nextLevelXp: 2000,
  level: 8,
  streak: 7,
  sprintsToday: 2,
  challenge: {
    title: 'Explain Big-O notation in 60 seconds',
    description:
      'Walk through time complexity from O(1) to O(n²) with one real-world example each.',
    difficulty: 'Medium' as Difficulty,
    type: 'text' as ChallengeType,
  } satisfies Challenge,
};

export const DEMO_SPRINT = {
  id: 'demo-challenge-001',
  type: 'multiple_choice' as ChallengeType,
  difficulty: 'Medium' as Difficulty,
  question: 'What is the time complexity of binary search?',
  options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
  correctIndex: 2,
};

export const DEMO_RESULTS = {
  score: 78,
  xpEarned: 50,
  percentile: 82,
  notes: [
    'Focus on time complexity trade-offs',
    'Consider space complexity next time',
    'Strong explanation of divide-and-conquer',
  ],
};

export const DEMO_LEADERBOARD_GLOBAL: LeaderEntry[] = [
  { rank: 1, username: 'JamieLee', score: 3800, trackId: 'coding', isCurrentUser: false },
  { rank: 2, username: 'RiverC', score: 3540, trackId: 'critical_thinking', isCurrentUser: false },
  { rank: 3, username: 'SophieM', score: 3210, trackId: 'design', isCurrentUser: false },
  { rank: 4, username: 'Demo User', score: 1240, trackId: 'coding', isCurrentUser: true },
  { rank: 5, username: 'TylerQ', score: 1190, trackId: 'writing', isCurrentUser: false },
  { rank: 6, username: 'AnaK', score: 1050, trackId: 'coding', isCurrentUser: false },
  { rank: 7, username: 'BenV', score: 980, trackId: 'design', isCurrentUser: false },
  { rank: 8, username: 'MelanieP', score: 890, trackId: 'critical_thinking', isCurrentUser: false },
  { rank: 9, username: 'OliverT', score: 740, trackId: 'writing', isCurrentUser: false },
  { rank: 10, username: 'ZoeW', score: 610, trackId: 'coding', isCurrentUser: false },
];

export const DEMO_LEADERBOARD_FRIENDS: LeaderEntry[] = [
  { rank: 1, username: 'JamieLee', score: 3800, trackId: 'coding', isCurrentUser: false },
  { rank: 2, username: 'Demo User', score: 1240, trackId: 'coding', isCurrentUser: true },
  { rank: 3, username: 'TylerQ', score: 1190, trackId: 'writing', isCurrentUser: false },
  { rank: 4, username: 'BenV', score: 980, trackId: 'design', isCurrentUser: false },
  { rank: 5, username: 'ZoeW', score: 610, trackId: 'coding', isCurrentUser: false },
];

export const DEMO_RIVAL = {
  weekRange: 'May 5 – May 11, 2026',
  userScore: 1240,
  rivalName: 'Alex K.',
  rivalScore: 900,
  userWins: 3,
  userLosses: 1,
  rivalWins: 1,
  rivalLosses: 3,
};

function buildCompletedDays(): string[] {
  const today = new Date();
  const result: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const keep = i < 7 || (i >= 10 && i < 14) || (i >= 18 && i < 21);
    if (keep) result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

export const DEMO_PROFILE = {
  username: 'Demo User',
  track: 'coding' as TrackId,
  streak: 7,
  skills: { speed: 72, accuracy: 85, depth: 60, consistency: 78 },
  completedDays: buildCompletedDays(),
};
