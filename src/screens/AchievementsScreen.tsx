import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAppStore } from '../store/appStore';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';

const ALL_ACHIEVEMENTS = [
  { id: 'first_scan', title: 'First Bite', description: 'Scan your first meal', icon: '📸', xpReward: 50, condition: 'meals >= 1' },
  { id: 'scan_10', title: 'Food Detective', description: 'Scan 10 meals', icon: '🔍', xpReward: 100, condition: 'meals >= 10' },
  { id: 'scan_50', title: 'Nutrition Nerd', description: 'Scan 50 meals', icon: '🧬', xpReward: 250, condition: 'meals >= 50' },
  { id: 'scan_100', title: 'Legend Logger', description: 'Scan 100 meals', icon: '🏆', xpReward: 500, condition: 'meals >= 100' },
  { id: 'streak_3', title: 'Getting Warm', description: '3-day login streak', icon: '🔥', xpReward: 30, condition: 'streak >= 3' },
  { id: 'streak_7', title: 'Week Warrior', description: '7-day streak', icon: '🗓', xpReward: 100, condition: 'streak >= 7' },
  { id: 'streak_30', title: 'Iron Will', description: '30-day streak', icon: '🦾', xpReward: 500, condition: 'streak >= 30' },
  { id: 'streak_100', title: 'Century Club', description: '100-day streak', icon: '💯', xpReward: 2000, condition: 'streak >= 100' },
  { id: 'silver_rank', title: 'Silver Lining', description: 'Reach Silver rank', icon: '🥈', xpReward: 100, condition: 'rank >= Silver' },
  { id: 'gold_rank', title: 'Going for Gold', description: 'Reach Gold rank', icon: '🥇', xpReward: 200, condition: 'rank >= Gold' },
  { id: 'diamond_rank', title: 'Diamond Mind', description: 'Reach Diamond rank', icon: '💎', xpReward: 500, condition: 'rank >= Diamond' },
  { id: 'emerald_rank', title: 'Emerald Elite', description: 'Reach Emerald rank', icon: '💚', xpReward: 1000, condition: 'rank >= Emerald' },
  { id: 'champion_rank', title: 'The Champion', description: 'Reach Champion rank', icon: '👑', xpReward: 2500, condition: 'rank = Champion' },
  { id: 'calorie_goal', title: 'On Target', description: 'Hit calorie goal 5 days in a row', icon: '🎯', xpReward: 150, condition: 'calorie_streak >= 5' },
  { id: 'protein_hero', title: 'Protein Hero', description: 'Hit protein goal 7 days straight', icon: '💪', xpReward: 200, condition: 'protein_streak >= 7' },
  { id: 'hydration_king', title: 'Hydration King', description: 'Hit water goal 7 days straight', icon: '💧', xpReward: 150, condition: 'water_streak >= 7' },
  { id: 'healthy_eater', title: 'Clean Eater', description: 'Log 10 meals with health score 80+', icon: '🥗', xpReward: 200, condition: 'healthy_meals >= 10' },
  { id: 'challenge_1', title: 'Challenge Accepted', description: 'Complete your first weekly challenge', icon: '⚡', xpReward: 100, condition: 'challenges_complete >= 1' },
  { id: 'challenge_5', title: 'Challenge Master', description: 'Complete 5 weekly challenges', icon: '🎖', xpReward: 300, condition: 'challenges_complete >= 5' },
  { id: 'early_bird', title: 'Early Bird', description: 'Log breakfast before 8am', icon: '🌅', xpReward: 50, condition: 'early_breakfast' },
];

export function AchievementsScreen() {
  const navigation = useNavigation();
  const { rankProgress, meals } = useAppStore();

  const RANK_ORDER = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Emerald', 'Champion'];

  const isUnlocked = (condition: string): boolean => {
    if (condition.startsWith('meals >=')) {
      const n = parseInt(condition.split('>=')[1]?.trim() ?? '0');
      return meals.length >= n;
    }
    if (condition.startsWith('streak >=')) {
      const n = parseInt(condition.split('>=')[1]?.trim() ?? '0');
      return rankProgress.streak >= n;
    }
    if (condition.startsWith('rank >=')) {
      const neededRank = condition.split('>=')[1]?.trim() ?? 'Bronze';
      const neededIdx = RANK_ORDER.indexOf(neededRank);
      const currentIdx = RANK_ORDER.indexOf(rankProgress.rank);
      return currentIdx >= neededIdx;
    }
    if (condition === 'rank = Champion') return rankProgress.rank === 'Champion';
    return false;
  };

  const unlocked = ALL_ACHIEVEMENTS.filter((a) => isUnlocked(a.condition));
  const locked = ALL_ACHIEVEMENTS.filter((a) => !isUnlocked(a.condition));

  const sorted = [...unlocked, ...locked];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏅 Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress summary */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>{unlocked.length} / {ALL_ACHIEVEMENTS.length} Unlocked</Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(unlocked.length / ALL_ACHIEVEMENTS.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressXP}>
          +{unlocked.reduce((s, a) => s + a.xpReward, 0)} XP earned from achievements
        </Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const unlocked = isUnlocked(item.condition);
          return (
            <View style={[styles.badge, !unlocked && styles.badgeLocked]}>
              <Text style={[styles.badgeIcon, !unlocked && styles.badgeIconLocked]}>
                {unlocked ? item.icon : '🔒'}
              </Text>
              <Text style={[styles.badgeTitle, !unlocked && styles.badgeTitleLocked]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.xpPill}>
                <Text style={[styles.xpText, !unlocked && { color: COLORS.mutedText }]}>
                  +{item.xpReward} XP
                </Text>
              </View>
              {unlocked && <View style={styles.unlockedDot} />}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  backBtnText: { color: COLORS.white, fontSize: 20, fontWeight: FONT.weights.bold },
  headerTitle: { fontSize: FONT.sizes.lg, color: COLORS.white, fontWeight: FONT.weights.bold },
  progressCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressTitle: { fontSize: FONT.sizes.md, color: COLORS.white, fontWeight: FONT.weights.bold, marginBottom: SPACING.sm },
  progressTrack: {
    height: 8, backgroundColor: COLORS.elevated, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.sm,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: RADIUS.full },
  progressXP: { fontSize: FONT.sizes.sm, color: COLORS.gold, fontWeight: FONT.weights.medium },
  list: { paddingHorizontal: SPACING.md, paddingBottom: 80 },
  row: { gap: SPACING.sm, marginBottom: SPACING.sm },
  badge: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
    position: 'relative',
    overflow: 'hidden',
  },
  badgeLocked: {
    borderColor: COLORS.border,
    opacity: 0.55,
  },
  badgeIcon: { fontSize: 38, marginBottom: SPACING.sm },
  badgeIconLocked: { opacity: 0.4 },
  badgeTitle: {
    fontSize: FONT.sizes.sm,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    textAlign: 'center',
    marginBottom: 3,
  },
  badgeTitleLocked: { color: COLORS.secondaryText },
  badgeDesc: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  xpPill: {
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  xpText: { fontSize: FONT.sizes.xs, color: COLORS.gold, fontWeight: FONT.weights.bold },
  unlockedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});
