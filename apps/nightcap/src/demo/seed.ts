import { JournalEntry, PatternCard, UserProfile } from '../lib/types';

function dateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function iso(daysAgo: number, hour = 21): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 14, 0, 0);
  return d.toISOString();
}

export const DEMO_USER: UserProfile = {
  uid: 'demo-user-001',
  displayName: 'Alex Chen',
  email: 'alex@demo.nightcap',
  createdAt: iso(20),
  trialStartDate: iso(20),
  tier: 'premium',
};

export const DEMO_JOURNALS: JournalEntry[] = [
  {
    date: dateString(0),
    transcript:
      "Today felt like a real turning point. Got into flow state around 10am and didn't surface until 1:30 — just pure, uninterrupted thinking. The afternoon was messy with a design review that ran long, but I didn't let it derail me. Took a 20-minute walk at 5pm. Came back clearheaded. Feeling good about where the project is headed.",
    tags: ['flow-state', 'focus', 'design', 'recovery'],
    ratings: { energy: 8, mood: 8, focus: 9, social: 5, output: 9 },
    createdAt: iso(0),
  },
  {
    date: dateString(1),
    transcript:
      "Back-to-back meetings from 9 to noon completely wrecked my morning. I know I should be blocking focus time but I keep saying yes when people need me. Afternoon was better — finally got through the backlog. Social energy was surprisingly high though, had a great 1:1 with Jordan that left me genuinely energized. Weird day.",
    tags: ['meetings', 'deep-work', 'energy', '1:1'],
    ratings: { energy: 5, mood: 6, focus: 4, social: 8, output: 5 },
    createdAt: iso(1),
  },
  {
    date: dateString(2),
    transcript:
      "Solid Tuesday. Mornings are really my sweet spot — knocked out the architecture doc by 11, reviewed two PRs before lunch. Hit a wall around 3pm, took a short break, came back and drafted the Q3 roadmap outline. Energy stayed consistent today. No calendar drama.",
    tags: ['architecture', 'code-review', 'roadmap', 'productivity'],
    ratings: { energy: 9, mood: 8, focus: 8, social: 4, output: 9 },
    createdAt: iso(2),
  },
  {
    date: dateString(3),
    transcript:
      "Wednesday is always weird. Good intentions, but the day kind of fragmented. Three short meetings that could've been Slack messages. Did ship one thing though — the auth refactor is finally merged. Mood was lower than usual, not sure why. Maybe cumulative fatigue. Need to sleep earlier.",
    tags: ['meetings', 'shipping', 'auth', 'fatigue'],
    ratings: { energy: 6, mood: 5, focus: 6, social: 5, output: 6 },
    createdAt: iso(3),
  },
  {
    date: dateString(4),
    transcript:
      "Really rough morning. Didn't sleep well, showed up to standup half-present. But something clicked at 2pm. Had a conversation with the design team that completely reframed how I was thinking about the onboarding flow. Sometimes constraints make things simpler. Output numbers don't reflect the mental shift that happened today.",
    tags: ['sleep', 'design', 'onboarding', 'reframe'],
    ratings: { energy: 4, mood: 5, focus: 4, social: 7, output: 4 },
    createdAt: iso(4),
  },
  {
    date: dateString(5),
    transcript:
      "Friday energy was actually strong today — rare. Wrapped up the sprint, closed out 6 tickets. Team retro went well. Had lunch with a friend outside the office for the first time in weeks. That completely shifted my afternoon. High social, high mood. These kinds of days remind me why the work matters.",
    tags: ['sprint', 'retro', 'social', 'energy'],
    ratings: { energy: 8, mood: 9, focus: 7, social: 9, output: 8 },
    createdAt: iso(5),
  },
  {
    date: dateString(6),
    transcript:
      "Saturday — catching up on reading and some light planning. Deliberately kept the laptop closed until 3pm. Mood was elevated all morning, dropped slightly in the evening after too much scrolling. Journaling helped reset. This feels like a healthy weekend.",
    tags: ['rest', 'reading', 'boundaries', 'recovery'],
    ratings: { energy: 7, mood: 8, focus: 5, social: 3, output: 3 },
    createdAt: iso(6),
  },
  {
    date: dateString(7),
    transcript:
      "Monday drag hit hard. Even after a decent weekend I still felt like I was moving through fog until about 11am. The 9am all-hands didn't help — too many updates, not enough signal. Afternoons are consistently better. Maybe I should negotiate later start times for deep work.",
    tags: ['monday', 'all-hands', 'fog', 'scheduling'],
    ratings: { energy: 4, mood: 5, focus: 4, social: 5, output: 5 },
    createdAt: iso(7),
  },
  {
    date: dateString(8),
    transcript:
      "Classic Tuesday surge. Had a hypothesis about the notification system architecture and just went deep on it for three hours. Forgot to eat lunch. Shipped a proof of concept by 2pm. These tunnel-vision sessions are my best work but I need to remember to come up for air. Body complained by evening.",
    tags: ['architecture', 'deep-work', 'notifications', 'hyperfocus'],
    ratings: { energy: 9, mood: 7, focus: 10, social: 2, output: 10 },
    createdAt: iso(8),
  },
  {
    date: dateString(9),
    transcript:
      "Balanced day. Not spectacular but consistent. Morning: planning. Afternoon: implementation. Evening: review. The team had a good sync. No fires. Mood was steady throughout. I think consistency is underrated. These quiet days compound.",
    tags: ['consistency', 'planning', 'team-sync', 'balance'],
    ratings: { energy: 7, mood: 7, focus: 7, social: 6, output: 7 },
    createdAt: iso(9),
  },
  {
    date: dateString(10),
    transcript:
      "Hit a blocker that cascaded. The third-party API we depend on had an undocumented rate limit. Spent two hours debugging before realizing it wasn't our code. Frustration was high at 11am. Recovered by afternoon — wrote a wrapper with exponential backoff, turned a bad situation into a useful abstraction.",
    tags: ['debugging', 'api', 'frustration', 'resilience'],
    ratings: { energy: 6, mood: 4, focus: 7, social: 4, output: 6 },
    createdAt: iso(10),
  },
  {
    date: dateString(11),
    transcript:
      "Good 1:1 with my manager today. Got clarity on a direction I'd been second-guessing. That kind of clarity is worth more than any technical win — it removes the mental tax of uncertainty. Afternoon I was on fire. Mood lifted significantly after that conversation.",
    tags: ['1:1', 'clarity', 'manager', 'motivation'],
    ratings: { energy: 7, mood: 9, focus: 8, social: 8, output: 8 },
    createdAt: iso(11),
  },
  {
    date: dateString(12),
    transcript:
      "Lower energy day. Lots of coordination work — PRs, comments, planning docs. Not the kind of work that gives me energy but someone has to do it. Social was oddly high though, lots of async back-and-forth with the team. Feeling productive but not in a way that shows on a diff.",
    tags: ['coordination', 'async', 'maintenance', 'teamwork'],
    ratings: { energy: 5, mood: 6, focus: 5, social: 8, output: 5 },
    createdAt: iso(12),
  },
  {
    date: dateString(13),
    transcript:
      "End of a long stretch. Everything ached a bit — mental fatigue showing up physically. Took a shorter day intentionally. Journaled early. Went to bed by 10pm. No heroics. Self-care as a technical decision.",
    tags: ['rest', 'self-care', 'fatigue', 'recovery'],
    ratings: { energy: 4, mood: 6, focus: 4, social: 3, output: 3 },
    createdAt: iso(13),
  },
  {
    date: dateString(14),
    transcript:
      "Two week mark. Looking back, I'm noticing patterns I wouldn't have caught without this habit. Tuesdays are consistently my highest focus days. Mondays are rough regardless of how the weekend goes. Social interactions — even brief ones — seem to shift my afternoon mood upward almost every time. Going to experiment with scheduling my most important work on Tuesdays.",
    tags: ['reflection', 'patterns', 'tuesday', 'social-lift'],
    ratings: { energy: 7, mood: 8, focus: 7, social: 6, output: 7 },
    createdAt: iso(14),
  },
];

// These pattern cards are generated from the above seed data, as a real
// generatePatterns Cloud Function would produce using Claude. The language,
// specificity, and actionability are the bar we hold the live LLM to.
export const DEMO_PATTERNS: PatternCard[] = [
  {
    id: 'pattern-001',
    emoji: '⚡',
    title: 'Tuesday is Your Prime Time',
    body: "Your focus and output scores spike every Tuesday — averaging 8.7 and 9.3 respectively over the past 14 days. Monday lows consistently recover by Tuesday morning regardless of sleep or weekend quality. This is your most reliable deep work window. Consider blocking your calendar Tuesday 9am–1pm as non-negotiable focus time and moving any recurring syncs to other days.",
    generatedAt: iso(1, 7),
    dataRange: { from: dateString(14), to: dateString(1) },
  },
  {
    id: 'pattern-002',
    emoji: '🤝',
    title: 'Social Interactions Unlock Your Afternoon',
    body: "On days when you rate Social ≥ 7, your afternoon output scores are on average 2.6 points higher than on low-social days. The effect is most pronounced when meaningful 1:1 contact happens before 2pm. You tend to self-identify as someone who finds social interaction draining — but the data tells a more nuanced story. Brief, purposeful connection (a good 1:1, a real lunch) appears to prime rather than deplete your cognitive engine.",
    generatedAt: iso(1, 7),
    dataRange: { from: dateString(14), to: dateString(1) },
  },
  {
    id: 'pattern-003',
    emoji: '🌙',
    title: 'Late Journaling Signals Unfinished Days',
    body: "Entries logged after 10pm correlate with Focus scores below 5 and Mood below 6. On nights you journal before 9:30pm, both metrics average 1.8 points higher. This suggests that delayed journaling is a symptom, not a cause — when the day felt incomplete or unsatisfying, the debrief gets pushed. Experiment with a firm 9pm journal ritual as a deliberate day-close signal, not a reactive recap.",
    generatedAt: iso(1, 7),
    dataRange: { from: dateString(14), to: dateString(1) },
  },
  {
    id: 'pattern-004',
    emoji: '🔋',
    title: 'Hyperfocus Days Have a Physical Cost',
    body: "Your three highest-focus days (scores 9–10) were each followed by a day with energy ≥2 points lower. The pattern is consistent: deep immersion pays off in output but draws down a biological reserve that takes 24 hours to replenish. Rather than back-to-back deep work days, consider building a lighter 'recovery day' cadence into your weekly plan — coordination tasks, async reviews, lighter creative work — that lets you sustain peak focus across the week rather than burning it in bursts.",
    generatedAt: iso(1, 7),
    dataRange: { from: dateString(14), to: dateString(1) },
  },
];
