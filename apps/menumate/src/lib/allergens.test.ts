import { describe, it, expect } from 'vitest';
import { flagAllergens } from './allergens';
import type { MenuItem } from './types';

const item = (name: string, description: string, ingredients: string[]): MenuItem => ({
  name,
  description,
  ingredients,
});

describe('flagAllergens', () => {
  describe('peanut scenario', () => {
    it('flags item containing peanuts in ingredients as danger', () => {
      const result = flagAllergens(
        [item('Pad Thai', 'Classic noodle dish', ['rice noodles', 'peanuts', 'lime'])],
        ['peanut']
      );
      expect(result[0].status).toBe('danger');
      expect(result[0].matchedAllergens).toContain('peanut');
    });

    it('flags item with peanut butter in ingredients as danger', () => {
      const result = flagAllergens(
        [item('Satay Chicken', 'With sauce', ['chicken', 'peanut butter', 'coconut milk'])],
        ['peanut']
      );
      expect(result[0].status).toBe('danger');
    });

    it('marks peanut-free item with full ingredient list as safe', () => {
      const result = flagAllergens(
        [item('Spring Rolls', 'Fresh rolls', ['rice paper', 'carrot', 'cucumber', 'mint'])],
        ['peanut']
      );
      expect(result[0].status).toBe('safe');
    });

    it('flags peanut in item name as danger', () => {
      const result = flagAllergens(
        [item('Peanut Noodles', '', ['noodles', 'sesame'])],
        ['peanut']
      );
      expect(result[0].status).toBe('danger');
    });
  });

  describe('gluten scenario', () => {
    it('flags item containing wheat flour as danger', () => {
      const result = flagAllergens(
        [item('Margherita Pizza', 'Classic pizza', ['wheat flour', 'tomato sauce', 'mozzarella'])],
        ['gluten']
      );
      expect(result[0].status).toBe('danger');
      expect(result[0].matchedAllergens).toContain('gluten');
    });

    it('flags item with wheat pasta as danger', () => {
      const result = flagAllergens(
        [item('Carbonara', 'Creamy pasta', ['wheat pasta', 'eggs', 'pancetta', 'parmesan'])],
        ['gluten']
      );
      expect(result[0].status).toBe('danger');
    });

    it('marks gluten-free item with full ingredient list as safe', () => {
      const result = flagAllergens(
        [item('Grilled Salmon', 'Salmon fillet', ['salmon', 'olive oil', 'lemon', 'asparagus'])],
        ['gluten']
      );
      expect(result[0].status).toBe('safe');
    });
  });

  describe('shellfish scenario', () => {
    it('flags item with shrimp in ingredients as danger', () => {
      const result = flagAllergens(
        [item('Shrimp Cocktail', 'Chilled shrimp', ['shrimp', 'lemon', 'cocktail sauce'])],
        ['shellfish']
      );
      expect(result[0].status).toBe('danger');
      expect(result[0].matchedAllergens).toContain('shellfish');
    });

    it('flags shellfish mentioned in description (empty ingredients) as danger', () => {
      const result = flagAllergens(
        [item('Surf & Turf', 'Steak with lobster tail', [])],
        ['shellfish']
      );
      expect(result[0].status).toBe('danger');
    });

    it('flags crab in ingredients as danger', () => {
      const result = flagAllergens(
        [item('Crab Cakes', 'Pan fried', ['crab', 'breadcrumb', 'mayo'])],
        ['shellfish']
      );
      expect(result[0].status).toBe('danger');
    });
  });

  describe('uncertain items', () => {
    it('returns warning when no ingredient data and user has allergens', () => {
      const result = flagAllergens([item('Mystery Dish', '', [])], ['peanut']);
      expect(result[0].status).toBe('warning');
    });

    it('returns warning for item with description-only info and no ingredients', () => {
      const result = flagAllergens(
        [item('Chef Special', 'Ask your server for details', [])],
        ['gluten']
      );
      expect(result[0].status).toBe('warning');
    });
  });

  describe('no allergens set', () => {
    it('marks all items safe when user has no allergens', () => {
      const result = flagAllergens(
        [
          item('Pad Thai', 'With peanuts', ['peanuts', 'noodles']),
          item('Pizza', 'Classic margherita', ['wheat flour', 'cheese']),
          item('Mystery', '', []),
        ],
        []
      );
      expect(result.every((r) => r.status === 'safe')).toBe(true);
    });
  });

  describe('multiple allergens', () => {
    it('reports all matched allergens when item triggers multiple', () => {
      const result = flagAllergens(
        [item('Peanut Butter Toast', 'Thick slice', ['peanut butter', 'wheat bread', 'butter'])],
        ['peanut', 'gluten', 'dairy']
      );
      expect(result[0].status).toBe('danger');
      expect(result[0].matchedAllergens).toContain('peanut');
      expect(result[0].matchedAllergens).toContain('gluten');
      expect(result[0].matchedAllergens).toContain('dairy');
    });

    it('only flags the allergens that match, not all user allergens', () => {
      const result = flagAllergens(
        [item('Caesar Salad', 'With anchovies', ['romaine', 'anchovy', 'parmesan', 'croutons'])],
        ['peanut', 'fish', 'dairy']
      );
      expect(result[0].matchedAllergens).not.toContain('peanut');
      expect(result[0].matchedAllergens).toContain('fish');
      expect(result[0].matchedAllergens).toContain('dairy');
    });
  });
});
