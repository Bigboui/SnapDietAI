import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/appStore';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { NutritionResultScreen } from '../screens/NutritionResultScreen';
import { AICoachScreen } from '../screens/AICoachScreen';
import { WeeklyReportScreen } from '../screens/WeeklyReportScreen';
import { GroceryListScreen } from '../screens/GroceryListScreen';
import { MoodTrackerScreen } from '../screens/MoodTrackerScreen';
import { BarcodeScreen } from '../screens/BarcodeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  Scan: undefined;
  NutritionResult: { analysisJson: string };
  AICoach: undefined;
  WeeklyReport: undefined;
  GroceryList: undefined;
  MoodTracker: undefined;
  Barcode: undefined;
  Settings: undefined;
  Achievements: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isOnboarded } = useAppStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      {!isOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen
            name="Scan"
            component={ScanScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="NutritionResult" component={NutritionResultScreen} />
          <Stack.Screen name="AICoach" component={AICoachScreen} />
          <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen} />
          <Stack.Screen name="GroceryList" component={GroceryListScreen} />
          <Stack.Screen name="MoodTracker" component={MoodTrackerScreen} />
          <Stack.Screen name="Barcode" component={BarcodeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
