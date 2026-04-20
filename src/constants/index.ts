import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN = { width, height };

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const FONT = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 42,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
};

export const RANKS = [
  { name: 'Bronze', minXP: 0, maxXP: 500, level: 1 },
  { name: 'Silver', minXP: 500, maxXP: 1500, level: 2 },
  { name: 'Gold', minXP: 1500, maxXP: 3000, level: 3 },
  { name: 'Diamond', minXP: 3000, maxXP: 6000, level: 4 },
  { name: 'Emerald', minXP: 6000, maxXP: 10000, level: 5 },
  { name: 'Champion', minXP: 10000, maxXP: 99999, level: 6 },
];

export const XP_REWARDS = {
  MEAL_SCAN: 50,
  CALORIE_GOAL: 75,
  PROTEIN_GOAL: 60,
  HYDRATION_GOAL: 40,
  STREAK_BONUS: 100,
  CHALLENGE_COMPLETE: 150,
  DAILY_LOGIN: 10,
};

export const DEMO_MEALS = [
  {
    id: '1',
    name: 'Grilled Chicken Rice Bowl',
    calories: 520,
    protein: 42,
    carbs: 58,
    fat: 12,
    fiber: 4,
    sugar: 3,
    healthScore: 88,
    glycemicIndex: 45,
    processingScore: 15,
    imageUrl: null,
    timestamp: Date.now() - 3600000,
    mealType: 'lunch',
  },
  {
    id: '2',
    name: 'Classic Burger Combo',
    calories: 890,
    protein: 38,
    carbs: 95,
    fat: 42,
    fiber: 3,
    sugar: 18,
    healthScore: 42,
    glycemicIndex: 72,
    processingScore: 68,
    imageUrl: null,
    timestamp: Date.now() - 86400000,
    mealType: 'dinner',
  },
  {
    id: '3',
    name: 'Atlantic Salmon Salad',
    calories: 380,
    protein: 35,
    carbs: 18,
    fat: 20,
    fiber: 6,
    sugar: 8,
    healthScore: 95,
    glycemicIndex: 32,
    processingScore: 8,
    imageUrl: null,
    timestamp: Date.now() - 172800000,
    mealType: 'lunch',
  },
  {
    id: '4',
    name: 'Whey Protein Shake',
    calories: 220,
    protein: 28,
    carbs: 22,
    fat: 4,
    fiber: 1,
    sugar: 12,
    healthScore: 72,
    glycemicIndex: 55,
    processingScore: 35,
    imageUrl: null,
    timestamp: Date.now() - 259200000,
    mealType: 'snack',
  },
  {
    id: '5',
    name: 'Creamy Pasta Bowl',
    calories: 680,
    protein: 22,
    carbs: 88,
    fat: 28,
    fiber: 5,
    sugar: 6,
    healthScore: 55,
    glycemicIndex: 65,
    processingScore: 45,
    imageUrl: null,
    timestamp: Date.now() - 345600000,
    mealType: 'dinner',
  },
];
