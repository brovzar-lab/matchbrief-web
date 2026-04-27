export interface Category {
  id: string;
  name: string;
  emoji: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface BudgetConfig {
  name: string;
  income: number;
  monthYear: string;
}

export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
}

export type OnboardingStep = 'income' | 'categories' | 'name';
