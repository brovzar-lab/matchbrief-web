import { onRequest } from 'firebase-functions/v2/https';
import Anthropic from '@anthropic-ai/sdk';

export type MenuItemResult = {
  name: string;
  description: string;
  ingredients: string[];
  allergenStatus: 'safe' | 'caution' | 'contains';
  matchedAllergens: string[];
};

type ParseMenuRequest = {
  image: string;
  userAllergens: string[];
};

const MOCK_ITEMS: MenuItemResult[] = [
  {
    name: 'Peanut Satay Chicken',
    description: 'Grilled chicken skewers with peanut dipping sauce',
    ingredients: ['chicken', 'peanuts', 'soy sauce', 'ginger', 'garlic', 'coconut milk'],
    allergenStatus: 'contains',
    matchedAllergens: [],
  },
  {
    name: 'Pad Thai Noodles',
    description: 'Rice noodles with egg, bean sprouts, and crushed peanuts',
    ingredients: ['rice noodles', 'egg', 'bean sprouts', 'peanuts', 'lime', 'fish sauce', 'tofu'],
    allergenStatus: 'contains',
    matchedAllergens: [],
  },
  {
    name: 'Garden Salad',
    description: 'Fresh mixed greens with lemon vinaigrette',
    ingredients: ['lettuce', 'tomato', 'cucumber', 'lemon juice', 'olive oil', 'salt', 'pepper'],
    allergenStatus: 'safe',
    matchedAllergens: [],
  },
  {
    name: 'Tomato Soup',
    description: 'Roasted tomato bisque',
    ingredients: ['tomatoes', 'onion', 'garlic', 'olive oil', 'vegetable stock', 'basil'],
    allergenStatus: 'safe',
    matchedAllergens: [],
  },
  {
    name: 'Garlic Bread',
    description: 'Toasted sourdough with garlic butter',
    ingredients: ['sourdough bread', 'wheat flour', 'butter', 'garlic', 'parsley'],
    allergenStatus: 'caution',
    matchedAllergens: [],
  },
];

function flagMockItems(items: MenuItemResult[], userAllergens: string[]): MenuItemResult[] {
  const normalized = userAllergens.map((a) => a.toLowerCase().trim());
  return items.map((item) => {
    const matched = item.ingredients.filter((ing) =>
      normalized.some((allergen) => ing.toLowerCase().includes(allergen)),
    );
    return {
      ...item,
      allergenStatus: matched.length > 0 ? 'contains' : item.allergenStatus,
      matchedAllergens: matched,
    };
  });
}

const isMockMode =
  !process.env.ANTHROPIC_API_KEY ||
  process.env.ANTHROPIC_API_KEY === 'REPLACE_WITH_VALUE';

export const parseMenu = onRequest(
  {
    cors: true,
    ...(isMockMode ? {} : { secrets: ['ANTHROPIC_API_KEY'] }),
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const body = req.body as Partial<ParseMenuRequest>;
    const { image, userAllergens } = body;

    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: '`image` (base64 string) is required' });
      return;
    }
    if (!Array.isArray(userAllergens)) {
      res.status(400).json({ error: '`userAllergens` (string[]) is required' });
      return;
    }

    if (isMockMode) {
      res.json({ items: flagMockItems(MOCK_ITEMS, userAllergens), mock: true });
      return;
    }

    const base64Data = image.replace(/^data:image\/[a-z+]+;base64,/, '');
    const client = new Anthropic();

    try {
      const allergenList =
        userAllergens.length > 0 ? userAllergens.join(', ') : 'none';

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        tools: [
          {
            name: 'extract_menu_items',
            description:
              'Return all menu items found in the image with allergen analysis.',
            input_schema: {
              type: 'object' as const,
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      ingredients: { type: 'array', items: { type: 'string' } },
                      allergenStatus: {
                        type: 'string',
                        enum: ['safe', 'caution', 'contains'],
                      },
                      matchedAllergens: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                    required: [
                      'name',
                      'description',
                      'ingredients',
                      'allergenStatus',
                      'matchedAllergens',
                    ],
                  },
                },
              },
              required: ['items'],
            },
          },
        ],
        tool_choice: { type: 'tool', name: 'extract_menu_items' },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: `Analyze this restaurant menu. User allergens to flag: ${allergenList}.

For each menu item:
- Extract name, description, and all identifiable ingredients
- Set allergenStatus:
  - "contains": allergen is clearly present as an ingredient
  - "caution": allergen might be present, preparation method unknown, or cross-contamination is possible
  - "safe": you are confident this allergen is not present
- List matched allergens in matchedAllergens

Critical rule: when uncertain, use "caution" — never assume "safe" by default.`,
              },
            ],
          },
        ],
      });

      const toolUse = response.content.find((c) => c.type === 'tool_use');
      if (!toolUse || toolUse.type !== 'tool_use') {
        res.status(500).json({ error: 'Unexpected response from AI model' });
        return;
      }

      const { items } = toolUse.input as { items: MenuItemResult[] };
      res.json({ items });
    } catch (err) {
      console.error('Claude API error:', err);
      res.status(500).json({ error: 'Failed to parse menu' });
    }
  },
);
