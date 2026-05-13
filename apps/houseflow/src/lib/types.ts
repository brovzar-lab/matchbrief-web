export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemo: boolean;
};

export type EmploymentType = 'salary' | 'freelance' | 'parttime' | 'other';

export type IncomeFrequency = 'monthly' | 'annual';

export type IncomeType = 'salary' | 'freelance' | 'rental' | 'other';

export type HouseholdMember = {
  userId: string;
  displayName: string;
  employmentType: EmploymentType;
  color: 'partner-a' | 'partner-b';
};

export type Household = {
  id: string;
  memberIds: string[];
  createdAt: Date;
  inviteCode: string;
  name: string;
  subscriptionStatus: 'trial' | 'active' | 'inactive';
  rcCustomerId: string | null;
};

export type Income = {
  id: string;
  userId: string;
  source: string;
  amount: number;
  frequency: IncomeFrequency;
  type: IncomeType;
};

export type ExpenseCategory =
  | 'housing'
  | 'groceries'
  | 'utilities'
  | 'transport'
  | 'dining'
  | 'health'
  | 'entertainment'
  | 'subscriptions'
  | 'other';

export type Expense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  isShared: boolean;
  splitRatio: number;
  addedBy: string;
  date: Date;
  label: string;
};

export type GoalStatus = 'active' | 'completed' | 'paused';

export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  targetDate: Date | null;
  status: GoalStatus;
};

export type GoalContribution = {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  date: Date;
};

export type HouseholdInvite = {
  householdId: string;
  expiresAt: Date;
};

export type SplitSummary = {
  partnerA: HouseholdMember;
  partnerB: HouseholdMember;
  partnerAMonthly: number;
  partnerBMonthly: number;
  householdMonthly: number;
  partnerARatio: number;
  partnerBRatio: number;
  sharedTotal: number;
  partnerAFairShare: number;
  partnerBFairShare: number;
  partnerAPersonal: number;
  partnerBPersonal: number;
  partnerAOwes: number;
  partnerBOwes: number;
};
