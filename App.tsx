import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/appStore';
import { storageService } from './src/services/storageService';
import { COLORS } from './src/constants/colors';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const { setUser, setMeals, setRankProgress, setSubscription } = useAppStore();

  useEffect(() => {
    async function prepare() {
      try {
        const user = await storageService.getUser();
        const meals = await storageService.getMeals();
        const rankProgress = await storageService.getRankProgress();
        const subscription = await storageService.getSubscription();

        if (user) setUser(user);
        if (meals) setMeals(meals);
        if (rankProgress) setRankProgress(rankProgress);
        if (subscription) setSubscription(subscription);
      } catch (e) {
        console.warn('Error loading app data:', e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: COLORS.primary,
              background: COLORS.background,
              card: COLORS.surface,
              text: COLORS.white,
              border: COLORS.border,
              notification: COLORS.primary,
            },
          }}
        >
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
