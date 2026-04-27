import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '../store/appStore';
import { storageService } from '../services/storageService';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, title, subtitle, onPress, rightElement, danger }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <View>
          <Text style={[styles.rowTitle, danger && { color: COLORS.red }]}>{title}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement ?? (onPress && <Text style={styles.chevron}>›</Text>)}
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation();
  const { user, subscription, setUser, setIsOnboarded } = useAppStore();
  const [notifications, setNotifications] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your meals, progress, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAll();
            setUser(null);
            setIsOnboarded(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data export will be emailed to you within 24 hours. (Premium feature preview)', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingRow
            icon="👤"
            title={user?.name ?? 'Guest User'}
            subtitle={user?.email ?? 'Set up your profile'}
            onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon!')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🎯"
            title="Goal"
            subtitle={user?.goal?.replace(/_/g, ' ') ?? 'Not set'}
            onPress={() => Alert.alert('Change Goal', 'Goal editing coming soon!')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🔥"
            title="Daily Calorie Target"
            subtitle={`${user?.calorieTarget ?? 2000} kcal`}
            onPress={() => Alert.alert('Edit Calories', 'Calorie target editing coming soon!')}
          />
        </View>

        {/* Subscription */}
        <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
        <View style={styles.card}>
          <SettingRow
            icon="⭐"
            title="Current Plan"
            subtitle={subscription.tier === 'free' ? 'Free Plan' : `${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan`}
            rightElement={
              subscription.tier === 'free' ? (
                <View style={styles.upgradeBadge}>
                  <Text style={styles.upgradeText}>Upgrade</Text>
                </View>
              ) : (
                <Text style={styles.activeBadge}>Active</Text>
              )
            }
            onPress={() => useAppStore.getState().setShowPaywall(true, 'settings')}
          />
          {subscription.tier !== 'free' && (
            <>
              <View style={styles.divider} />
              <SettingRow
                icon="🔄"
                title="Restore Purchases"
                onPress={() => Alert.alert('Restore', 'Checking your purchases...')}
              />
            </>
          )}
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <SettingRow
            icon="🔔"
            title="Push Notifications"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={(v) => { setNotifications(v); Haptics.selectionAsync(); }}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🍽"
            title="Meal Reminders"
            subtitle="Get reminded to log your meals"
            rightElement={
              <Switch
                value={mealReminders}
                onValueChange={(v) => { setMealReminders(v); Haptics.selectionAsync(); }}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="📊"
            title="Weekly Reports"
            subtitle="Sunday AI summary notification"
            rightElement={
              <Switch
                value={weeklyReport}
                onValueChange={(v) => { setWeeklyReport(v); Haptics.selectionAsync(); }}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            }
          />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          <SettingRow
            icon="📳"
            title="Haptic Feedback"
            rightElement={
              <Switch
                value={haptics}
                onValueChange={(v) => { setHaptics(v); Haptics.selectionAsync(); }}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="⚖️"
            title="Unit System"
            subtitle="Metric (kg, cm)"
            onPress={() => Alert.alert('Units', 'Unit switching coming soon!')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🌙"
            title="App Theme"
            subtitle="Dark (default)"
            onPress={() => Alert.alert('Theme', 'Light mode coming soon!')}
          />
        </View>

        {/* Data */}
        <Text style={styles.sectionLabel}>DATA & PRIVACY</Text>
        <View style={styles.card}>
          <SettingRow
            icon="📤"
            title="Export My Data"
            subtitle="Download all your nutrition data"
            onPress={handleExportData}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🔒"
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'Opens in browser (coming soon)')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="📋"
            title="Terms of Service"
            onPress={() => Alert.alert('Terms', 'Opens in browser (coming soon)')}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <SettingRow icon="📱" title="App Version" subtitle="1.0.0 (Build 1)" />
          <View style={styles.divider} />
          <SettingRow
            icon="⭐"
            title="Rate FlashDiet AI"
            onPress={() => Alert.alert('Rate Us', 'Opening App Store... (coming soon)')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="💬"
            title="Send Feedback"
            onPress={() => Alert.alert('Feedback', 'Opening feedback form... (coming soon)')}
          />
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionLabel}>DANGER ZONE</Text>
        <View style={styles.card}>
          <SettingRow
            icon="🗑"
            title="Reset All Data"
            subtitle="Delete all meals, progress & settings"
            onPress={handleResetData}
            danger
          />
        </View>

        <Text style={styles.footer}>FlashDiet AI · Made with ❤️ for healthy living</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  sectionLabel: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.semibold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  rowIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  rowTitle: { fontSize: FONT.sizes.md, color: COLORS.white, fontWeight: FONT.weights.medium },
  rowSubtitle: { fontSize: FONT.sizes.xs, color: COLORS.secondaryText, marginTop: 2 },
  chevron: { fontSize: 22, color: COLORS.secondaryText },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 58 },
  upgradeBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  upgradeText: { fontSize: FONT.sizes.xs, color: COLORS.background, fontWeight: FONT.weights.bold },
  activeBadge: { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: FONT.weights.bold },
  footer: {
    textAlign: 'center',
    color: COLORS.mutedText,
    fontSize: FONT.sizes.sm,
    marginTop: SPACING.xl,
  },
});
