import { UserProfile, Session, SessionStep } from '../lib/types';

function iso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
}

export const DEMO_USER: UserProfile = {
  uid: 'demo-user-001',
  displayName: 'Alex Rivera',
  email: 'alex@demo.micromentor',
  createdAt: iso(30),
  currentStreak: 5,
  lastSessionDate: iso(1),
  dimensions: {
    leadership: 7,
    communication: 6,
    strategy: 5,
    execution: 8,
    influence: 5,
    selfAwareness: 7,
  },
  onboardingComplete: true,
  isPremium: false,
};

const DEMO_STEPS_DAY1: SessionStep[] = [
  {
    type: 'scenario',
    promptText:
      'Your highest performer just told you they are thinking about leaving for a competitor. You have 24 hours before they make their decision. What do you do first?',
    responseFormat: 'choice',
    choices: [
      'Schedule an immediate 1:1 to understand their reasons',
      'Talk to HR about a retention package',
      'Ask their peers if they knew about this',
      'Give them space to decide independently',
    ],
  },
  {
    type: 'reflection',
    promptText:
      'Think about the last time someone on your team felt undervalued. What signals did you miss, and what would you do differently?',
    responseFormat: 'text',
  },
  {
    type: 'micro_lesson',
    promptText:
      '**Retention starts before the resignation.** Research shows 70% of employees who leave feel their manager could have done something to keep them — but most managers only hear about dissatisfaction when it\'s too late. The antidote: a monthly "stay interview" — 15 minutes asking what keeps them engaged and what would make them consider leaving. This turns retention from reactive to proactive.',
    responseFormat: 'choice',
    choices: ['Got it — I\'ll start stay interviews', 'I already do this regularly', 'Not feasible for my team right now'],
  },
  {
    type: 'reflection',
    promptText:
      'Name one person on your team who you haven\'t had a meaningful career conversation with in the last 60 days. What would you ask them this week?',
    responseFormat: 'text',
  },
  {
    type: 'scenario',
    promptText:
      'You implement stay interviews starting next week. Your top performer comes back and says they\'re staying — but only if they can lead the next major project. You already promised it to someone else. How do you handle this?',
    responseFormat: 'choice',
    choices: [
      'Keep your original promise — consistency matters',
      'Find a way to make both people leads on the project',
      'Have an honest conversation with both people about the tradeoffs',
      'Let your top performer lead and apologize to the other person',
    ],
  },
];

const DEMO_STEPS_DAY2: SessionStep[] = [
  {
    type: 'scenario',
    promptText:
      'You need to give critical feedback to a senior team member whose work is consistently good but whose communication style is damaging team morale. How do you open the conversation?',
    responseFormat: 'choice',
    choices: [
      'Lead with specific examples of the behavior',
      'Ask them how they think they\'re perceived by the team',
      'Start with what they\'re doing well, then address the behavior',
      'Send written feedback first so they have time to process it',
    ],
  },
  {
    type: 'reflection',
    promptText:
      'When did you last give someone feedback that felt genuinely uncomfortable to deliver? What made it hard and what happened afterward?',
    responseFormat: 'text',
  },
  {
    type: 'micro_lesson',
    promptText:
      '**The SBI Framework:** Situation–Behavior–Impact. Describe the specific *Situation*, the observable *Behavior* (not intent or personality), and the concrete *Impact* on the team or work. This removes judgment from feedback and makes it easier to receive. Example: "In yesterday\'s design review (S), you interrupted the engineer twice before they finished their point (B), and I noticed they stopped contributing for the rest of the meeting (I)."',
    responseFormat: 'choice',
    choices: ['I\'ll use SBI next time', 'I already use something similar', 'This feels too scripted for me'],
  },
  {
    type: 'reflection',
    promptText:
      'Write out one piece of feedback you\'ve been avoiding giving someone. Use the SBI format: Situation, Behavior, Impact.',
    responseFormat: 'text',
  },
  {
    type: 'scenario',
    promptText:
      'You deliver the SBI feedback. The senior team member gets defensive and says the team "needs to toughen up." How do you respond?',
    responseFormat: 'choice',
    choices: [
      'Acknowledge their perspective, then restate the impact with a specific example',
      'End the conversation and follow up in writing',
      'Involve HR to mediate',
      'Ask them what they think healthy team communication looks like',
    ],
  },
];

const DEMO_STEPS_DAY3: SessionStep[] = [
  {
    type: 'scenario',
    promptText:
      'Your skip-level executive asks you to deliver a 5-minute update on your team\'s Q3 progress in tomorrow\'s all-hands. You have 18 hours to prepare. What is your first move?',
    responseFormat: 'choice',
    choices: [
      'Identify the three most important outcomes and lead with those',
      'Gather detailed data from the team to show comprehensive progress',
      'Write a full script to avoid missing anything',
      'Ask a peer what the executive usually focuses on',
    ],
  },
  {
    type: 'reflection',
    promptText:
      'Describe a time you presented to senior leadership. What worked, and what would you change about how you structured your message?',
    responseFormat: 'text',
  },
  {
    type: 'micro_lesson',
    promptText:
      '**Executive Communication = Pyramid Principle.** Start with your conclusion, then support it with 2-3 key points, then details only if asked. Executives think top-down; most presenters deliver bottom-up. Flip it. "We are on track for Q3 — here\'s why. First, we shipped the core feature two weeks ahead of schedule. Second, customer NPS is up 8 points. Third, we have zero critical open bugs." Done.',
    responseFormat: 'choice',
    choices: ['This is how I\'ll structure it', 'I do this naturally already', 'I find bottom-up more credible'],
  },
  {
    type: 'reflection',
    promptText:
      'Take your current Q3 update. Write the opening line using the Pyramid Principle — your conclusion first, in one sentence.',
    responseFormat: 'text',
  },
  {
    type: 'scenario',
    promptText:
      'The executive interrupts your all-hands update to ask a detailed technical question you don\'t know the answer to. The room is watching. What do you say?',
    responseFormat: 'choice',
    choices: [
      '"Great question — I don\'t have that number off the top of my head, I\'ll follow up by EOD"',
      'Redirect to someone on your team who knows the answer',
      'Give your best estimate and flag that it\'s an estimate',
      'Say you\'ll need to check and move on quickly',
    ],
  },
];

export const DEMO_SESSIONS: Session[] = [
  {
    id: 'session-001',
    date: iso(4),
    title: 'Retaining Your Best People Before It\'s Too Late',
    content: DEMO_STEPS_DAY1,
    rating: 5,
    resonatedText: 'The stay interview concept — I\'ve never done this and now I realize why I should.',
    completedAt: iso(4),
  },
  {
    id: 'session-002',
    date: iso(3),
    title: 'Giving Feedback That Actually Lands',
    content: DEMO_STEPS_DAY2,
    rating: 4,
    resonatedText: 'SBI framework is simple enough that I\'ll actually use it.',
    completedAt: iso(3),
  },
  {
    id: 'session-003',
    date: iso(2),
    title: 'Presenting to Executives Without Losing the Room',
    content: DEMO_STEPS_DAY3,
    rating: 5,
    resonatedText: 'Pyramid principle — I\'ve been doing it backwards my whole career.',
    completedAt: iso(2),
  },
];

export const DEMO_TODAY_SESSION: Session = {
  id: 'session-today',
  date: new Date().toISOString(),
  title: 'Building Influence Without Authority',
  content: [
    {
      type: 'scenario',
      promptText:
        'You need a peer team to prioritize work that helps your team but doesn\'t directly benefit them. Their manager is skeptical. How do you get buy-in?',
      responseFormat: 'choice',
      choices: [
        'Show them the data on why this helps the broader org',
        'Find a way to make the work valuable for them too',
        'Escalate to your shared manager',
        'Do the work yourself to avoid the dependency',
      ],
    },
    {
      type: 'reflection',
      promptText:
        'Think of a time you needed to influence someone you had no authority over. What worked? What didn\'t?',
      responseFormat: 'text',
    },
    {
      type: 'micro_lesson',
      promptText:
        '**Currency of Influence:** You build influence through deposits — helping others before you need them, sharing credit publicly, making their problems your problems when you can. Influence is a balance sheet, not a one-time ask. The managers who get cross-team work done fastest are the ones who invested before they needed anything.',
      responseFormat: 'choice',
      choices: ['I need to make more deposits', 'I think I do this well', 'This is too political for my style'],
    },
    {
      type: 'reflection',
      promptText:
        'Name one colleague you\'ll need help from in the next 90 days. What can you do for them *this week* that has nothing to do with what you\'ll eventually ask for?',
      responseFormat: 'text',
    },
    {
      type: 'scenario',
      promptText:
        'You\'ve been building the relationship for three weeks — helping, sharing credit, making their work easier. Now you need to make the ask. How do you frame it?',
      responseFormat: 'choice',
      choices: [
        '"Here\'s how this helps your team too — not just mine"',
        '"I know I\'ve been asking for a lot — I want to be direct about what I need"',
        '"Our shared manager suggested we collaborate on this"',
        '"I\'d love your take on the best way to tackle this together"',
      ],
    },
  ],
  rating: null,
  resonatedText: null,
  completedAt: null,
};
