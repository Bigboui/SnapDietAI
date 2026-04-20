import { create } from 'zustand';
import {
  User,
  Meal,
  RankProgress,
  Subscription,
  DailyLog,
  Challenge,
  WaterEntry,
  GroceryItem,
  MoodEntry,
  FastingSession,
} from '../types';
import { RANKS, XP_REWARDS, DEMO_MEALS } from '../constants';
import { storageService } from '../services/storageService';

const TODAY = new Date().toISOString().split('T')[0];

const DEFAULT_RANK_PROGRESS: RankProgress = {
  currentXP: 320,
  totalXP: 320,
  rank: 'Bronze',
  level: 1,
  streak: 3,
  longestStreak: 7,
  lastScanDate: null,
  lastLoginDate: TODAY,
  achievements: [],
  weeklyXP: 320,
  monthlyXP: 320,
};

const DEFAULT_SUBSCRIPTION: Subscription = {
  tier: 'free',
  expiresAt: null,
  purchasedAt: null,
  productId: null,
};

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Protein King',
    description: 'Hit your protein goal 5 days this week',
    icon: '💪',
    targetDays: 5,
    currentDays: 2,
    xpReward: 150,
    type: 'protein',
    weekStart: TODAY,
    completed: false,
    active: true,
  },
  {
    id: 'c2',
    title: 'Calorie Champion',
    description: 'Stay under your calorie goal 4 days',
    icon: '🎯',
    targetDays: 4,
    currentDays: 1,
    xpReward: 120,
    type: 'calories',
    weekStart: TODAY,
    completed: false,
    active: true,
  },
  {
    id: 'c3',
    title: 'Hydration Hero',
    description: 'Drink 2L of water 5 days this week',
    icon: '💧',
    targetDays: 5,
    currentDays: 3,
    xpReward: 100,
    type: 'water',
    weekStart: TODAY,
    completed: false,
    active: true,
  },
];

interface AppState {
  user: User | null;
  meals: Meal[];
  rankProgress: RankProgress;
  subscription: Subscription;
  dailyLog: DailyLog | null;
  challenges: Challenge[];
  waterEntries: WaterEntry[];
  groceryList: GroceryItem[];
  moodEntries: MoodEntry[];
  activeFasting: FastingSession | null;
  showPaywall: boolean;
  paywallFeature: string;
  isOnboarded: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setMeals: (meals: Meal[]) => void;
  addMeal: (meal: Meal) => void;
  setRankProgress: (progress: RankProgress) => void;
  setSubscription: (sub: Subscription) => void;
  addXP: (amount: number, reason?: string) => Promise<boolean>; // returns true if ranked up
  addWater: (amount: number) => void;
  updateChallenge: (id: string, progress: Partial<Challenge>) => void;
  addGroceryItem: (item: GroceryItem) => void;
  toggleGroceryItem: (id: string) => void;
  addMoodEntry: (entry: MoodEntry) => void;
  startFasting: (session: FastingSession) => void;
  endFasting: () => void;
  setShowPaywall: (show: boolean, feature?: string) => void;
  setIsOnboarded: (val: boolean) => void;
  getTodayMeals: () => Meal[];
  getTodayCalories: () => number;
  getTodayProtein: () => number;
  getTodayCarbs: () => number;
  getTodayFat: () => number;
  getTodayWater: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  meals: DEMO_MEALS as Meal[],
  rankProgress: DEFAULT_RANK_PROGRESS,
  subscription: DEFAULT_SUBSCRIPTION,
  dailyLog: null,
  challenges: DEFAULT_CHALLENGES,
  waterEntries: [
    { amount: 250, timestamp: Date.now() - 7200000 },
    { amount: 500, timestamp: Date.now() - 3600000 },
    { amount: 350, timestamp: Date.now() - 1800000 },
  ],
  groceryList: [],
  moodEntries: [],
  activeFasting: null,
  showPaywall: false,
  paywallFeature: '',
  isOnboarded: false,

  setUser: (user) => {
    set({ user, isOnboarded: !!user?.onboardingComplete });
    if (user) storageService.saveUser(user);
  },

  setMeals: (meals) => set({ meals }),

  addMeal: (meal) => {
    const meals = [meal, ...get().meals];
    set({ meals });
    storageService.saveMeals(meals);
    // Award XP
    get().addXP(XP_REWARDS.MEAL_SCAN, 'Meal scanned');
  },

  setRankProgress: (rankProgress) => {
    set({ rankProgress });
    storageService.saveRankProgress(rankProgress);
  },

  setSubscription: (subscription) => {
    set({ subscription });
    storageService.saveSubscription(subscription);
  },

  addXP: async (amount, _reason) => {
    const { rankProgress } = get();
    const newTotalXP = rankProgress.totalXP + amount;
    const newCurrentXP = rankProgress.currentXP + amount;

    // Check rank up
    const currentRankData = RANKS.find((r) => r.name === rankProgress.rank);
    const nextRankData = RANKS[RANKS.findIndex((r) => r.name === rankProgress.rank) + 1];

    let newRank = rankProgress.rank;
    let newLevel = rankProgress.level;
    let rankedUp = false;
    let newCurrentXPFinal = newCurrentXP;

    if (nextRankData && newTotalXP >= nextRankData.minXP) {
      newRank = nextRankData.name as RankProgress['rank'];
      newLevel = nextRankData.level;
      rankedUp = true;
      newCurrentXPFinal = newTotalXP - nextRankData.minXP;
    }

    const updated: RankProgress = {
      ...rankProgress,
      totalXP: newTotalXP,
      currentXP: newCurrentXPFinal,
      rank: newRank,
      level: newLevel,
      weeklyXP: rankProgress.weeklyXP + amount,
      monthlyXP: rankProgress.monthlyXP + amount,
    };

    set({ rankProgress: updated });
    storageService.saveRankProgress(updated);
    return rankedUp;
  },

  addWater: (amount) => {
    const entry: WaterEntry = { amount, timestamp: Date.now() };
    const waterEntries = [entry, ...get().waterEntries];
    set({ waterEntries });
  },

  updateChallenge: (id, progress) => {
    const challenges = get().challenges.map((c) =>
      c.id === id ? { ...c, ...progress } : c
    );
    set({ challenges });
  },

  addGroceryItem: (item) => {
    set({ groceryList: [...get().groceryList, item] });
  },

  toggleGroceryItem: (id) => {
    set({
      groceryList: get().groceryList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    });
  },

  addMoodEntry: (entry) => {
    set({ moodEntries: [entry, ...get().moodEntries] });
  },

  startFasting: (session) => set({ activeFasting: session }),

  endFasting: () => set({ activeFasting: null }),

  setShowPaywall: (show, feature = '') => set({ showPaywall: show, paywallFeature: feature }),

  setIsOnboarded: (val) => set({ isOnboarded: val }),

  getTodayMeals: () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return get().meals.filter((m) => m.timestamp >= todayStart.getTime());
  },

  getTodayCalories: () =>
    get()
      .getTodayMeals()
      .reduce((sum, m) => sum + m.calories, 0),

  getTodayProtein: () =>
    get()
      .getTodayMeals()
      .reduce((sum, m) => sum + m.protein, 0),

  getTodayCarbs: () =>
    get()
      .getTodayMeals()
      .reduce((sum, m) => sum + m.carbs, 0),

  getTodayFat: () =>
    get()
      .getTodayMeals()
      .reduce((sum, m) => sum + m.fat, 0),

  getTodayWater: () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return get()
      .waterEntries.filter((w) => w.timestamp >= todayStart.getTime())
      .reduce((sum, w) => sum + w.amount, 0);
  },
}));
