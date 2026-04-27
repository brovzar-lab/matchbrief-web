import type { ThemeCluster, ResurfacedThought, VoiceThought } from './types';

const workThoughts: VoiceThought[] = [
  {
    id: 'w1',
    text: 'Need to finish the Q2 product roadmap before Friday\'s board meeting.',
    recordedAt: '2026-04-24T09:15:00Z',
    duration: 18,
    clusterId: 'work',
    clusterConfidence: 0.94,
  },
  {
    id: 'w2',
    text: 'Should I pitch the new API redesign to the team? It could save us two full weeks.',
    recordedAt: '2026-04-22T14:30:00Z',
    duration: 22,
    clusterId: 'work',
    clusterConfidence: 0.88,
  },
  {
    id: 'w3',
    text: 'The performance review cycle is coming up — make a list of wins before it sneaks up on me.',
    recordedAt: '2026-04-20T08:00:00Z',
    duration: 25,
    clusterId: 'work',
    clusterConfidence: 0.91,
  },
  {
    id: 'w4',
    text: 'Consider moving the standup to async — it would save the whole team four hours a week.',
    recordedAt: '2026-04-13T11:45:00Z',
    duration: 19,
    clusterId: 'work',
    clusterConfidence: 0.86,
  },
];

const creativeThoughts: VoiceThought[] = [
  {
    id: 'c1',
    text: 'Story idea: a city where everyone loses their memories every seven years and rebuilds identity from scratch.',
    recordedAt: '2026-04-26T22:10:00Z',
    duration: 31,
    clusterId: 'creative',
    clusterConfidence: 0.97,
  },
  {
    id: 'c2',
    text: 'What if the app had a visual mode that shows thoughts as drifting clouds, clustering together over time?',
    recordedAt: '2026-04-23T19:55:00Z',
    duration: 28,
    clusterId: 'creative',
    clusterConfidence: 0.92,
  },
  {
    id: 'c3',
    text: 'I keep coming back to this idea of a color-based journal — no words, just hues that capture the emotional texture of a day.',
    recordedAt: '2026-04-20T21:30:00Z',
    duration: 35,
    clusterId: 'creative',
    clusterConfidence: 0.89,
  },
];

const personalThoughts: VoiceThought[] = [
  {
    id: 'p1',
    text: 'Called mom today and realized how much I miss those simple Sunday dinners. Need to visit soon.',
    recordedAt: '2026-04-25T20:40:00Z',
    duration: 27,
    clusterId: 'personal',
    clusterConfidence: 0.93,
  },
  {
    id: 'p2',
    text: 'Feeling a bit disconnected from old friends lately. Maybe plan a trip or a group call this month?',
    recordedAt: '2026-04-24T18:20:00Z',
    duration: 24,
    clusterId: 'personal',
    clusterConfidence: 0.87,
  },
  {
    id: 'p3',
    text: 'Want to be more intentional about time with Mia — put the phone down when we\'re together.',
    recordedAt: '2026-04-21T21:00:00Z',
    duration: 20,
    clusterId: 'personal',
    clusterConfidence: 0.9,
  },
  {
    id: 'p4',
    text: 'I\'ve been overthinking the next step. Sometimes letting yourself drift without a destination is okay.',
    recordedAt: '2026-04-17T23:05:00Z',
    duration: 29,
    clusterId: 'personal',
    clusterConfidence: 0.85,
  },
];

const healthThoughts: VoiceThought[] = [
  {
    id: 'h1',
    text: 'Thirty minutes of morning movement changed everything this week. Need to protect that habit.',
    recordedAt: '2026-04-26T07:30:00Z',
    duration: 21,
    clusterId: 'health',
    clusterConfidence: 0.95,
  },
  {
    id: 'h2',
    text: 'Cut out the afternoon coffee and I\'m sleeping so much better. Sticking with this.',
    recordedAt: '2026-04-23T16:10:00Z',
    duration: 18,
    clusterId: 'health',
    clusterConfidence: 0.92,
  },
  {
    id: 'h3',
    text: 'Noticed I hold my breath when I\'m stressed. Try box breathing — four counts in, hold, out, hold.',
    recordedAt: '2026-04-19T12:00:00Z',
    duration: 33,
    clusterId: 'health',
    clusterConfidence: 0.88,
  },
];

export const demoClusters: ThemeCluster[] = [
  {
    id: 'work',
    name: 'Work',
    color: '#2563eb',
    bgColor: '#eff6ff',
    emoji: '💼',
    thoughts: workThoughts,
  },
  {
    id: 'creative',
    name: 'Creative',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    emoji: '✨',
    thoughts: creativeThoughts,
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#db2777',
    bgColor: '#fdf2f8',
    emoji: '🌿',
    thoughts: personalThoughts,
  },
  {
    id: 'health',
    name: 'Health',
    color: '#059669',
    bgColor: '#ecfdf5',
    emoji: '🌱',
    thoughts: healthThoughts,
  },
];

export const demoResurfaced: ResurfacedThought[] = [
  {
    thought: workThoughts[2],
    relevanceScore: 0.91,
    reason: 'Performance review season is near — this thought from a week ago is timely.',
  },
  {
    thought: personalThoughts[3],
    relevanceScore: 0.87,
    reason: 'You captured this 10 days ago — worth revisiting when things feel uncertain.',
  },
  {
    thought: creativeThoughts[0],
    relevanceScore: 0.83,
    reason: 'Your creative cluster is active. This idea hasn\'t been explored yet.',
  },
];

export function getClusterById(id: string): ThemeCluster | undefined {
  return demoClusters.find((c) => c.id === id);
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}
