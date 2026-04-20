import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { RankRing } from '../components/RankRing';
import { MacroBar } from '../components/MacroBar';
import { WaterTracker } from '../components/WaterTracker';
import { ChallengeCard } from '../components/ChallengeCard';
import { MealCard } from '../components/MealCard';
import { PaywallModal } from '../components/PaywallModal';
import { useAppStore } from '../store/appStore';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS, XP_REWARDS } from '../constants';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const {
    user,
    rankProgress,
    subscription,
    challenges,
    getTodayMeals,
    getTodayCalories,
    getTodayProtein,
    getTodayCarbs,
    getTodayFat,
    getTodayWater,
    addWater,
    addXP,
    setShowPaywall,
  } = useAppStore();

  const [refreshing, setRefreshing] = React.useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const todayMeals = getTodayMeals();
  const todayCalories = getTodayCalories();
  const todayProtein = getTodayProtein();
  const todayCarbs = getTodayCarbs();
  const todayFat = getTodayFat();
  const todayWater = getTodayWater();

  const calorieTarget = user?.calorieTarget ?? 2000;
  const proteinTarget = user?.proteinTarget ?? 150;
  const carbTarget = user?.carbTarget ?? 220;
  const fatTarget = user?.fatTarget ?? 65;
  const waterTarget = user?.waterTarget ?? 2500;

  const calorieProgress = todayCalories / calorieTarget;

  const handleScan = () => {
    if (subscription.tier === 'free' && todayMeals.length >= 1) {
      setShowPaywall(true, 'Unlimited Scans');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Scan');
  };

  const handleAddWater = (amount: number) => {
    addWater(amount);
    addXP(XP_REWARDS.HYDRATION_GOAL / 8);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <PaywallModal />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View>
            <Text style={styles.greeting}>{greeting()}, {user?.name ?? 'Champion'} 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Achievements')}
          >
            <Text style={styles.notifIcon}>🏆</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* RANK RING HERO */}
        <Animated.View
          style={[styles.heroSection, { opacity: fadeAnim }]}
        >
          <View style={styles.rankRingWrapper}>
            <RankRing rankProgress={rankProgress} size={220} />
          </View>

          {/* XP Level info below ring */}
          <View style={styles.xpInfoRow}>
            <View style={styles.xpInfoItem}>
              <Text style={styles.xpInfoValue}>{rankProgress.totalXP.toLocaleString()}</Text>
              <Text style={styles.xpInfoLabel}>Total XP</Text>
            </View>
            <View style={styles.xpInfoDivider} />
            <View style={styles.xpInfoItem}>
              <Text style={styles.xpInfoValue}>Lvl {rankProgress.level}</Text>
              <Text style={styles.xpInfoLabel}>Level</Text>
            </View>
            <View style={styles.xpInfoDivider} />
            <View style={styles.xpInfoItem}>
              <Text style={styles.xpInfoValue}>{rankProgress.weeklyXP}</Text>
              <Text style={styles.xpInfoLabel}>This Week</Text>
            </View>
          </View>
        </Animated.View>

        {/* Calorie Ring */}
        <View style={styles.card}>
          <View style={styles.calorieSectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Today's Calories</Text>
            <TouchableOpacity onPress={handleScan} style={styles.scanQuickBtn}>
              <Text style={styles.scanQuickText}>+ Log Meal</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calorieDisplay}>
            <View style={styles.calorieNumbers}>
              <Text style={styles.calorieCurrent}>{todayCalories}</Text>
              <Text style={styles.calorieTarget}> / {calorieTarget} kcal</Text>
            </View>
            <Text style={styles.calorieRemaining}>
              {calorieTarget - todayCalories > 0
                ? `${calorieTarget - todayCalories} kcal remaining`
                : `${todayCalories - calorieTarget} kcal over goal`}
            </Text>
          </View>

          {/* Calorie progress bar */}
          <View style={styles.calorieProgressTrack}>
            <View
              style={[
                styles.calorieProgressFill,
                {
                  width: `${Math.min(calorieProgress * 100, 100)}%`,
                  backgroundColor:
                    calorieProgress > 1 ? COLORS.red : calorieProgress > 0.85 ? COLORS.gold : COLORS.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Macros */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💊 Macros</Text>
          <View style={styles.macrosContainer}>
            <MacroBar
              label="Protein"
              current={todayProtein}
              target={proteinTarget}
              unit="g"
              color="#FF6B8A"
              emoji="🥩"
            />
            <MacroBar
              label="Carbs"
              current={todayCarbs}
              target={carbTarget}
              unit="g"
              color={COLORS.gold}
              emoji="🌾"
            />
            <MacroBar
              label="Fat"
              current={todayFat}
              target={fatTarget}
              unit="g"
              color={COLORS.cyan}
              emoji="🥑"
            />
          </View>
        </View>

        {/* Hydration */}
        <View style={styles.card}>
          <WaterTracker
            current={todayWater}
            target={waterTarget}
            onAdd={handleAddWater}
          />
        </View>

        {/* Today's Challenge */}
        {challenges.filter((c) => c.active && !c.completed).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🎯 Weekly Challenges</Text>
            {challenges
              .filter((c) => c.active)
              .slice(0, 2)
              .map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
          </View>
        )}

        {/* Recent Meals */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🍽 Today's Meals</Text>
            <TouchableOpacity onPress={handleScan}>
              <Text style={styles.seeAllText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {todayMeals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍽</Text>
              <Text style={styles.emptyTitle}>No meals logged yet</Text>
              <Text style={styles.emptySubtitle}>Snap your first meal to get started!</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={handleScan}>
                <Text style={styles.emptyBtnText}>📷 Scan a Meal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todayMeals.slice(0, 3).map((meal) => (
              <MealCard key={meal.id} meal={meal} compact />
            ))
          )}
        </View>

        {/* Quick actions */}
        <View style={[styles.card, styles.quickActions]}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionGrid}>
            {[
              { icon: '🤖', label: 'AI Coach', action: () => {
                if (subscription.tier !== 'premium') {
                  setShowPaywall(true, 'AI Coach');
                } else {
                  navigation.navigate('AICoach');
                }
              }},
              { icon: '📊', label: 'Weekly Report', action: () => navigation.navigate('WeeklyReport') },
              { icon: '🛒', label: 'Grocery List', action: () => {
                if (subscription.tier === 'free') {
                  setShowPaywall(true, 'Grocery List');
                } else {
                  navigation.navigate('GroceryList');
                }
              }},
              { icon: '😊', label: 'Mood Track', action: () => navigation.navigate('MoodTracker') },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.quickActionBtn}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <Text style={styles.quickActionIcon}>{item.icon}</Text>
                <Text style={styles.quickActionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Floating Scan Button */}
      <TouchableOpacity style={styles.floatingScanBtn} onPress={handleScan} activeOpacity={0.85}>
        <View style={styles.floatingScanGlow} />
        <Text style={styles.floatingScanText}>📷 Snap a Meal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  greeting: {
    fontSize: FONT.sizes.xl,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  date: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifIcon: {
    fontSize: 22,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  rankRingWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  xpInfoRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  xpInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  xpInfoValue: {
    fontSize: FONT.sizes.xl,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  xpInfoLabel: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  xpInfoDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONT.weights.semibold,
  },
  calorieSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scanQuickBtn: {
    backgroundColor: COLORS.primaryGlow,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  scanQuickText: {
    color: COLORS.primary,
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.semibold,
  },
  calorieDisplay: {
    marginBottom: SPACING.md,
  },
  calorieNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calorieCurrent: {
    fontSize: 42,
    color: COLORS.white,
    fontWeight: FONT.weights.black,
  },
  calorieTarget: {
    fontSize: FONT.sizes.lg,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.medium,
  },
  calorieRemaining: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  calorieProgressTrack: {
    height: 10,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  calorieProgressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  macrosContainer: {
    gap: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    fontSize: FONT.sizes.md,
  },
  quickActions: {},
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickActionBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  quickActionIcon: {
    fontSize: 28,
  },
  quickActionLabel: {
    fontSize: FONT.sizes.sm,
    color: COLORS.white,
    fontWeight: FONT.weights.semibold,
    textAlign: 'center',
  },
  floatingScanBtn: {
    position: 'absolute',
    bottom: 100,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  floatingScanGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(0,214,143,0.1)',
  },
  floatingScanText: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
});
