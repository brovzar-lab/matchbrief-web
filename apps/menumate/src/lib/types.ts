export interface MenuItem {
  name: string;
  description: string;
  ingredients: string[];
}

export type AllergenStatus = 'safe' | 'warning' | 'danger';

export interface FlaggedMenuItem extends MenuItem {
  status: AllergenStatus;
  matchedAllergens: string[];
}

export interface UserProfile {
  allergens: string[];
  dietaryRestrictions: string[];
}

export interface SampleMenu {
  id: string;
  name: string;
  menu: MenuItem[];
}
