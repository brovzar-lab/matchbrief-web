import type { MenuItem, FlaggedMenuItem, AllergenStatus } from './types';

const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  peanut: ['peanut', 'peanuts', 'groundnut', 'groundnuts', 'arachis', 'peanut butter'],
  gluten: ['wheat', 'barley', 'rye', 'spelt', 'kamut', 'triticale', 'gluten', 'flour', 'breadcrumb', 'bread crumb'],
  shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'scallop', 'clam', 'oyster', 'mussel', 'barnacle'],
  dairy: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'lactose', 'whey', 'casein', 'ghee', 'parmesan', 'mozzarella', 'cheddar', 'brie', 'gouda', 'ricotta', 'mascarpone', 'provolone'],
  egg: ['egg', 'eggs', 'albumin', 'mayonnaise', 'meringue'],
  tree_nut: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia', 'brazil nut', 'hazelnut', 'chestnut'],
  soy: ['soy', 'soya', 'tofu', 'tempeh', 'edamame', 'miso'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'bass', 'flounder', 'anchovy', 'sardine', 'halibut', 'trout'],
};

function containsAllergen(text: string, allergen: string): boolean {
  const lower = text.toLowerCase();
  const keywords = ALLERGEN_KEYWORDS[allergen.toLowerCase()] ?? [allergen.toLowerCase()];
  return keywords.some((kw) => lower.includes(kw));
}

function itemMatchesAllergen(item: MenuItem, allergen: string): boolean {
  return (
    containsAllergen(item.name, allergen) ||
    containsAllergen(item.description, allergen) ||
    item.ingredients.some((ing) => containsAllergen(ing, allergen))
  );
}

export function flagAllergens(menuItems: MenuItem[], userAllergens: string[]): FlaggedMenuItem[] {
  return menuItems.map((item) => {
    if (userAllergens.length === 0) {
      return { ...item, status: 'safe' as AllergenStatus, matchedAllergens: [] };
    }

    const matchedAllergens = userAllergens.filter((a) => itemMatchesAllergen(item, a));

    if (matchedAllergens.length > 0) {
      return { ...item, status: 'danger' as AllergenStatus, matchedAllergens };
    }

    // When uncertain (no ingredients provided), default to warning — NEVER guess Safe
    const hasIngredientData = item.ingredients.length > 0;
    const status: AllergenStatus = hasIngredientData ? 'safe' : 'warning';

    return { ...item, status, matchedAllergens: [] };
  });
}
