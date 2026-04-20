import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppStore } from '../store/appStore';
import { COLORS, getRankColor } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';
import { FeatureCard } from '../components/FeatureCard';
import { RootStackParamList } from '../navigation/RootNavigator';
import { storageService } from '../services/storageService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, rankProgress, subscription, setIsOnboarded, setUser } = useAppStore();

  const rankColor = getRankColor(rankProgress.rank);

  const tierLabel = {
    free: 'Free',
    pro: 'Pro 👑',
    premium: 'Premium 💎',
  }[subscription.tier];

  const handleUpgrade = () => {
    useAppStore.getState().setShowPaywall(true, 'Premium features');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Reset App',
      'This will clear all your data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAll();
            setUser(null);
            setIsOnboarded(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile hero */}
        <LinearGradient
          colors={[`${rankColor}25`, 'transparent']}
          style={styles.profileHero}
        >
          <View style={[styles.avatar, { borderColor: rankColor }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Champion'}</Text>
          <View style={[styles.rankBadge, { backgroundColor: `${rankColor}20`, borderColor: rankColor }]}>
            <Text style={[styles.rankBadgeText, { color: rankColor }]}>
              {rankProgress.rank} — Level {rankProgress.level}
            </Text>
          </View>
          <Text style={styles.subscriptionBadge}>
            {tierLabel}
          </Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{rankProgress.totalXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{rankProgress.streak}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{useAppStore.getState().meals.length}</Text>
            <Text style={styles.statLabel}>Meals Logged</Text>
          </View>
        </View>

        {/* Upgrade CTA if free */}
        {subscription.tier === 'free' && (
          <TouchableOpacity style={styles.upgradeBanner} onPress={handleUpgrade}>
            <LinearGradient
              colors={['rgba(0,214,143,0.15)', 'rgba(0,214,143,0.05)']}
              style={styles.upgradeBannerGradient}
            >
              <Text style={styles.upgradeBannerEmoji}>👑</Text>
              <View style={styles.upgradeBannerText}>
                <Text style={styles.upgradeBannerTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeBannerSubtitle}>Unlock unlimited scans & more</Text>
              </View>
              <Text style={styles.upgradeBannerArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* My Info */}
        <Text style={styles.sectionTitle}>My Info</Text>
        {user && (
          <View style={styles.infoCard}>
            {[
              { label: 'Goal', value: user.goal.replace('_', ' ') },
              { label: 'Calorie Target', value: `${user.calorieTarget} kcal` },
              { label: 'Protein Target', value: `${user.proteinTarget}g` },
              { label: 'Weight', value: `${user.weight} kg` },
              { label: 'Height', value: `${user.height} cm` },
              { label: 'Activity Level', value: user.activityLevel.replace('_', ' ') },
            ].map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Features */}
        <Text style={styles.sectionTitle}>Features</Text>
        <FeatureCard
          icon="🏆"
          title="Achievements"
          subtitle="View all your badges"
          color={COLORS.gold}
          onPress={() => navigation.navigate('Achievements')}
        />
        <FeatureCard
          icon="📊"
          title="Weekly Report"
          subtitle="AI-powered nutrition recap"
          color={COLORS.cyan}
          onPress={() => navigation.navigate('WeeklyReport')}
        />
        <FeatureCard
          icon="🤖"
          title="AI Coach"
          subtitle="Your personal nutrition coach"
          color={COLORS.primary}
          onPress={() => {
            if (subscription.tier !== 'premium') {
              useAppStore.getState().setShowPaywall(true, 'AI Coach');
            } else {
              navigation.navigate('AICoach');
            }
          }}
          locked={subscription.tier !== 'premium'}
        />
        <FeatureCard
          icon="🛒"
          title="Grocery List"
          subtitle="Smart shopping helper"
          color="#FF8C00"
          onPress={() => {
            if (subscription.tier === 'free') {
              useAppStore.getState().setShowPaywall(true, 'Grocery List');
            } else {
              navigation.navigate('GroceryList');
            }
          }}
          locked={subscription.tier === 'free'}
        />
        <FeatureCard
          icon="😊"
          title="Mood Tracker"
          subtitle="Track energy & wellbeing"
          color="#9B59B6"
          onPress={() => navigation.navigate('MoodTracker')}
        />
        <FeatureCard
          icon="⚙️"
          title="Settings"
          subtitle="Notifications & preferences"
          color={COLORS.secondaryText}
          onPress={() => navigation.navigate('Settings')}
        />

        {/* Danger zone */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>🗑 Reset App Data</Text>
        </TouchableOpacity>

        <Text style={styles.version}>SnapDiet AI v1.0.0 — Made with 💚</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 100,
  },
  profileHero: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginBottom: SPACING.md,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  userName: {
    fontSize: FONT.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONT.weights.black,
    marginBottom: SPACING.sm,
  },
  rankBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  rankBadgeText: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subscriptionBadge: {
    fontSize: FONT.sizes.md,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.medium,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONT.weights.black,
  },
  statLabel: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  upgradeBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,214,143,0.3)',
  },
  upgradeBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  upgradeBannerEmoji: {
    fontSize: 28,
  },
  upgradeBannerText: {
    flex: 1,
  },
  upgradeBannerTitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  upgradeBannerSubtitle: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  upgradeBannerArrow: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: FONT.weights.bold,
  },
  sectionTitle: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: FONT.sizes.md,
    color: COLORS.secondaryText,
    textTransform: 'capitalize',
  },
  infoValue: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.semibold,
    textTransform: 'capitalize',
  },
  signOutBtn: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,71,87,0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,71,87,0.3)',
  },
  signOutText: {
    color: COLORS.red,
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.semibold,
  },
  version: {
    textAlign: 'center',
    color: COLORS.mutedText,
    fontSize: FONT.sizes.sm,
    marginTop: SPACING.xl,
  },
});
