import type { MenuItem, SampleMenu } from './types';

const peanutMenu: MenuItem[] = [
  {
    name: 'Pad Thai',
    description: 'Classic Thai rice noodles stir-fried with egg and vegetables',
    ingredients: ['rice noodles', 'shrimp', 'peanuts', 'bean sprouts', 'lime', 'fish sauce', 'egg'],
  },
  {
    name: 'Spring Rolls',
    description: 'Fresh rice paper rolls with crunchy vegetables and herbs',
    ingredients: ['rice paper', 'lettuce', 'carrot', 'cucumber', 'mint', 'vermicelli', 'tofu'],
  },
  {
    name: 'Chicken Satay',
    description: 'Grilled chicken skewers served with peanut dipping sauce',
    ingredients: ['chicken', 'peanut butter', 'coconut milk', 'lemongrass', 'soy sauce', 'turmeric'],
  },
  {
    name: 'Tom Yum Soup',
    description: 'Spicy and sour Thai soup with mushrooms',
    ingredients: ['mushrooms', 'lemongrass', 'galangal', 'kaffir lime leaves', 'chilli', 'lime juice'],
  },
  {
    name: 'Mango Sticky Rice',
    description: 'Traditional Thai dessert with sweet coconut sticky rice',
    ingredients: ['sticky rice', 'coconut milk', 'mango', 'sugar', 'salt'],
  },
];

const glutenMenu: MenuItem[] = [
  {
    name: 'Margherita Pizza',
    description: 'Classic Neapolitan pizza with tomato and mozzarella',
    ingredients: ['wheat flour', 'tomato sauce', 'mozzarella', 'basil', 'olive oil'],
  },
  {
    name: 'Caprese Salad',
    description: 'Fresh tomato, mozzarella and basil with balsamic glaze',
    ingredients: ['tomatoes', 'mozzarella', 'basil', 'olive oil', 'balsamic vinegar'],
  },
  {
    name: 'Pasta Carbonara',
    description: 'Creamy Roman pasta with pancetta and parmesan',
    ingredients: ['pasta', 'eggs', 'pancetta', 'parmesan', 'black pepper'],
  },
  {
    name: 'Grilled Salmon',
    description: 'Atlantic salmon fillet with seasonal vegetables',
    ingredients: ['salmon', 'olive oil', 'lemon', 'asparagus', 'garlic', 'thyme'],
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian coffee dessert',
    ingredients: ['savoiardi biscuits', 'mascarpone', 'eggs', 'espresso', 'cocoa powder'],
  },
];

export const sampleMenus: SampleMenu[] = [
  { id: 'peanut', name: 'Thai Garden Restaurant', menu: peanutMenu },
  { id: 'gluten', name: 'Roma Pizza & Pasta', menu: glutenMenu },
];
