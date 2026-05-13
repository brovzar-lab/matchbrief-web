import type {
  Household,
  HouseholdMember,
  Income,
  Expense,
  Goal,
  GoalContribution,
  AuthUser,
} from './types';

export const DEMO_USER: AuthUser = {
  uid: 'demo-alex-uid',
  email: 'alex@houseflow.app',
  displayName: 'Alex',
  isDemo: true,
};

export const DEMO_HOUSEHOLD: Household = {
  id: 'demo-household-1',
  memberIds: ['demo-alex-uid', 'demo-jordan-uid'],
  createdAt: new Date('2026-01-15'),
  inviteCode: 'HF9K2M',
  name: 'Alex & Jordan',
  subscriptionStatus: 'trial',
  rcCustomerId: null,
};

export const DEMO_MEMBERS: HouseholdMember[] = [
  {
    userId: 'demo-alex-uid',
    displayName: 'Alex',
    employmentType: 'salary',
    color: 'partner-a',
  },
  {
    userId: 'demo-jordan-uid',
    displayName: 'Jordan',
    employmentType: 'freelance',
    color: 'partner-b',
  },
];

export const DEMO_INCOMES: Income[] = [
  {
    id: 'inc-1',
    userId: 'demo-alex-uid',
    source: 'Software Engineer — Acme Corp',
    amount: 95000,
    frequency: 'annual',
    type: 'salary',
  },
  {
    id: 'inc-2',
    userId: 'demo-jordan-uid',
    source: 'Freelance Design',
    amount: 65000,
    frequency: 'annual',
    type: 'freelance',
  },
];

export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    amount: 2800,
    category: 'housing',
    isShared: true,
    splitRatio: 0.59,
    addedBy: 'demo-alex-uid',
    date: new Date('2026-05-01'),
    label: 'Rent',
  },
  {
    id: 'exp-2',
    amount: 180,
    category: 'utilities',
    isShared: true,
    splitRatio: 0.59,
    addedBy: 'demo-jordan-uid',
    date: new Date('2026-05-03'),
    label: 'Electricity & Internet',
  },
  {
    id: 'exp-3',
    amount: 420,
    category: 'groceries',
    isShared: true,
    splitRatio: 0.59,
    addedBy: 'demo-alex-uid',
    date: new Date('2026-05-07'),
    label: 'Weekly groceries x2',
  },
  {
    id: 'exp-4',
    amount: 95,
    category: 'transport',
    isShared: false,
    splitRatio: 1,
    addedBy: 'demo-alex-uid',
    date: new Date('2026-05-04'),
    label: 'Monthly transit pass',
  },
  {
    id: 'exp-5',
    amount: 60,
    category: 'subscriptions',
    isShared: false,
    splitRatio: 1,
    addedBy: 'demo-jordan-uid',
    date: new Date('2026-05-02'),
    label: 'Adobe CC',
  },
];

export const DEMO_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Emergency Fund',
    targetAmount: 10000,
    targetDate: new Date('2026-12-31'),
    status: 'active',
  },
];

export const DEMO_GOAL_CONTRIBUTIONS: GoalContribution[] = [
  {
    id: 'contrib-1',
    goalId: 'goal-1',
    userId: 'demo-alex-uid',
    amount: 2500,
    date: new Date('2026-03-01'),
  },
  {
    id: 'contrib-2',
    goalId: 'goal-1',
    userId: 'demo-jordan-uid',
    amount: 1500,
    date: new Date('2026-04-01'),
  },
];
