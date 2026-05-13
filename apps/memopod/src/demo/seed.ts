import { Memo, WeeklySummary, UserProfile } from '../lib/types';

function iso(daysAgo: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function futureIso(daysAhead: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const DEMO_USER: UserProfile = {
  uid: 'demo-user-001',
  displayName: 'Jordan Kim',
  email: 'jordan@demo.memopod',
  createdAt: iso(30),
  memoCountThisMonth: 14,
  isPremium: false,
};

export const DEMO_MEMOS: Memo[] = [
  {
    id: 'memo-001',
    text: 'What if we built a habit tracker that rewards streaks with actual charitable donations? The longer your streak, the more the app donates to a cause you pick.',
    category: 'idea',
    createdAt: iso(0, 9, 15),
    durationSec: 12,
    extractedDate: null,
    isPremium: false,
  },
  {
    id: 'memo-002',
    text: 'Need to call the dentist before end of week to reschedule the appointment that got cancelled.',
    category: 'reminder',
    createdAt: iso(0, 11, 40),
    durationSec: 8,
    extractedDate: futureIso(3, 10),
    isPremium: false,
  },
  {
    id: 'memo-003',
    text: 'Review the Q2 OKRs doc and leave comments for Sarah before the planning meeting on Thursday.',
    category: 'task',
    createdAt: iso(0, 14, 22),
    durationSec: 10,
    extractedDate: futureIso(2, 9),
    isPremium: false,
  },
  {
    id: 'memo-004',
    text: 'The barista at the corner shop on Market Street is named Leo. He remembered my order without me saying anything today. Small things like that make the whole day better.',
    category: 'note',
    createdAt: iso(1, 8, 5),
    durationSec: 14,
    extractedDate: null,
    isPremium: false,
  },
  {
    id: 'memo-005',
    text: 'Build a weekend-only focus mode in the app — no notifications, just the core capture loop. Might be what distinguishes us from the noise.',
    category: 'idea',
    createdAt: iso(1, 10, 30),
    durationSec: 9,
    extractedDate: null,
    isPremium: false,
  },
  {
    id: 'memo-006',
    text: 'Follow up with Marcus about the invoice from last month. It has been 30 days and I still haven\'t heard back.',
    category: 'task',
    createdAt: iso(1, 13, 0),
    durationSec: 7,
    extractedDate: null,
    isPremium: false,
  },
  {
    id: 'memo-007',
    text: 'Pick up dry cleaning on the way home Friday. They close at 6pm.',
    category: 'reminder',
    createdAt: iso(2, 9, 0),
    durationSec: 6,
    extractedDate: futureIso(4, 17),
    isPremium: false,
  },
  {
    id: 'memo-008',
    text: 'Read the first three chapters of the Systems Thinking book before the book club on the 20th.',
    category: 'task',
    createdAt: iso(2, 16, 45),
    durationSec: 11,
    extractedDate: null,
    isPremium: false,
  },
  {
    id: 'memo-009',
    text: 'Walking meeting this morning changed everything. The idea I\'ve been stuck on for two weeks just came to me the moment I got outside. Need to do more of these.',
    category: 'note',
    createdAt: iso(3, 9, 30),
    durationSec: 16,
    extractedDate: null,
    isPremium: false,
  },
  {
    id: 'memo-010',
    text: 'What if the onboarding was entirely voice-driven? No typing at all for the first session. Could be a strong first impression differentiator.',
    category: 'idea',
    createdAt: iso(3, 11, 15),
    durationSec: 10,
    extractedDate: null,
    isPremium: false,
  },
  {
    id: 'memo-011',
    text: 'Water the plants in the office on Monday morning. The one by the window is looking sad.',
    category: 'reminder',
    createdAt: iso(4, 8, 0),
    durationSec: 7,
    extractedDate: futureIso(3, 9),
    isPremium: false,
  },
  {
    id: 'memo-012',
    text: 'Write post-mortem for the deploy issue last Tuesday. It has been on the backlog for four days.',
    category: 'task',
    createdAt: iso(4, 14, 0),
    durationSec: 9,
    extractedDate: null,
    isPremium: false,
  },
  {
    id: 'memo-013',
    text: 'The team retrospective format we tried today — three columns, silent voting, then top 3 only — was genuinely better than anything we\'ve done in two years. Keep this.',
    category: 'note',
    createdAt: iso(5, 16, 0),
    durationSec: 18,
    extractedDate: null,
    isPremium: false,
  },
  {
    id: 'memo-014',
    text: 'Offline-first sync engine as a shared package. Every app we build keeps reinventing this. Time to do it once properly.',
    category: 'idea',
    createdAt: iso(6, 10, 0),
    durationSec: 12,
    extractedDate: null,
    isPremium: false,
  },
];

export const DEMO_WEEKLY_SUMMARY: WeeklySummary = {
  counts: {
    idea: 5,
    task: 4,
    reminder: 3,
    note: 2,
  },
  total: 14,
  conversionRate: 57,
  generatedAt: iso(0, 6),
};

// Demo transcripts used for the fake recording cycle
export const DEMO_TRANSCRIPTS: Array<{ text: string; category: Memo['category'] }> = [
  {
    text: 'What if the weekly review screen showed a heat map of when during the day you capture most memos? Could reveal energy patterns.',
    category: 'idea',
  },
  {
    text: 'Send the revised proposal to the client before noon tomorrow.',
    category: 'task',
  },
  {
    text: 'Call mom on Sunday — her birthday is the 18th.',
    category: 'reminder',
  },
  {
    text: 'The coffee meeting with Alex was unexpectedly great. He thinks in systems, not features. Rare.',
    category: 'note',
  },
  {
    text: 'Add dark mode support to the app. Half the users are night owls anyway.',
    category: 'idea',
  },
  {
    text: 'Finish the slide deck for the board update by Wednesday end of day.',
    category: 'task',
  },
  {
    text: 'Book the hotel for the conference before the block rate expires next Friday.',
    category: 'reminder',
  },
  {
    text: 'The energy after the all-hands was noticeably different today. People are excited again. Good sign.',
    category: 'note',
  },
];
