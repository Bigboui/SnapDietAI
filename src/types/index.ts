export interface User {
  id: string;
  name: string;
  email?: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'gain_muscle' | 'eat_healthier';
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  waterTarget: number; // ml
  createdAt: number;
  avatar?: string;
  onboardingComplete: boolean;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber: number; // g
  sugar: number; // g
  healthScore: number; // 0-100
  glycemicIndex: number; // 0-100
  processingScore: number; // 0-100, lower is better
  imageUrl: string | null;
  timestamp: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  aiSuggestions?: string[];
  servingSize?: string;
  isBarcode?: boolean;
  barcode?: string;
}

export interface RankProgress {
  currentXP: number;
  totalXP: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Emerald' | 'Champion';
  level: number;
  streak: number;
  longestStreak: number;
  lastScanDate: string | null;
  lastLoginDate: string | null;
  achievements: Achievement[];
  weeklyXP: number;
  monthlyXP: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  xpReward: number;
}

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface Subscription {
  tier: SubscriptionTier;
  expiresAt: number | null;
  purchasedAt: number | null;
  productId: string | null;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: string[]; // meal IDs
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number; // ml
  calorieGoalHit: boolean;
  proteinGoalHit: boolean;
  waterGoalHit: boolean;
  xpEarned: number;
  mood?: MoodEntry;
  fastingSession?: FastingSession;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  averageCalories: number;
  averageProtein: number;
  daysOnTrack: number;
  biggestWin: string;
  biggestIssue: string;
  recommendation: string;
  totalXPEarned: number;
  mealsLogged: number;
  waterGoalsDays: number;
  generatedAt: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetDays: number;
  currentDays: number;
  xpReward: number;
  type: 'protein' | 'calories' | 'water' | 'streak' | 'scan';
  weekStart: string;
  completed: boolean;
  active: boolean;
}

export interface MoodEntry {
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  timestamp: number;
}

export interface FastingSession {
  startTime: number;
  endTime: number | null;
  targetHours: number;
  protocol: '16:8' | '18:6' | '20:4' | '24h' | '5:2';
  completed: boolean;
  caloriesEaten?: number;
}

export interface WaterEntry {
  amount: number; // ml
  timestamp: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  addedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface FoodScanResult {
  meal: Meal;
  confidence: number;
  alternatives?: Partial<Meal>[];
}

export interface NutritionAnalysis {
  meal: Meal;
  suggestions: string[];
  warnings: string[];
  healthHighlights: string[];
}
