import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Meal, RankProgress, Subscription } from '../types';

const KEYS = {
  USER: '@flashdiet_user',
  MEALS: '@flashdiet_meals',
  RANK_PROGRESS: '@flashdiet_rank',
  SUBSCRIPTION: '@flashdiet_subscription',
  DAILY_LOGS: '@flashdiet_daily_logs',
  WATER_ENTRIES: '@flashdiet_water',
  GROCERY_LIST: '@flashdiet_grocery',
  MOOD_ENTRIES: '@flashdiet_mood',
  ONBOARDED: '@flashdiet_onboarded',
};

class StorageService {
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user:', e);
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async saveMeals(meals: Meal[]): Promise<void> {
    try {
      // Only save last 100 meals
      const toSave = meals.slice(0, 100);
      await AsyncStorage.setItem(KEYS.MEALS, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save meals:', e);
    }
  }

  async getMeals(): Promise<Meal[] | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.MEALS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async saveRankProgress(progress: RankProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.RANK_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save rank progress:', e);
    }
  }

  async getRankProgress(): Promise<RankProgress | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.RANK_PROGRESS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async saveSubscription(subscription: Subscription): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SUBSCRIPTION, JSON.stringify(subscription));
    } catch (e) {
      console.error('Failed to save subscription:', e);
    }
  }

  async getSubscription(): Promise<Subscription | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SUBSCRIPTION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async setOnboarded(value: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.ONBOARDED, JSON.stringify(value));
  }

  async getOnboarded(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(KEYS.ONBOARDED);
      return data ? JSON.parse(data) : false;
    } catch {
      return false;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  }
}

export const storageService = new StorageService();
