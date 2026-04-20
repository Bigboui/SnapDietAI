import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { MealCard } from '../components/MealCard';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';
import { Meal } from '../types';

function groupMealsByDate(meals: Meal[]): { title: string; data: Meal[] }[] {
  const groups: Record<string, Meal[]> = {};
  meals.forEach((meal) => {
    const date = new Date(meal.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let label: string;
    if (date.toDateString() === today.toDateString()) {
      label = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      label = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
    if (!groups[label]) groups[label] = [];
    groups[label]!.push(meal);
  });

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

export function HistoryScreen() {
  const { meals } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');

  const filtered = filter === 'all' ? meals : meals.filter((m) => m.mealType === filter);
  const grouped = groupMealsByDate(filtered);

  const totalCalories = filtered.reduce((s, m) => s + m.calories, 0);
  const totalMeals = filtered.length;
  const avgHealth = filtered.length
    ? Math.round(filtered.reduce((s, m) => s + m.healthScore, 0) / filtered.length)
    : 0;

  const FILTERS: Array<{ id: typeof filter; label: string; emoji: string }> = [
    { id: 'all', label: 'All', emoji: '🍽' },
    { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { id: 'lunch', label: 'Lunch', emoji: '☀️' },
    { id: 'dinner', label: 'Dinner', emoji: '🌙' },
    { id: 'snack', label: 'Snack', emoji: '🍎' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal History</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalMeals}</Text>
          <Text style={styles.statLabel}>Meals</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCalories.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total kcal</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: avgHealth >= 70 ? COLORS.primary : COLORS.gold }]}>
            {avgHealth}
          </Text>
          <Text style={styles.statLabel}>Avg Health</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={styles.filterEmoji}>{f.emoji}</Text>
            <Text style={[styles.filterLabel, filter === f.id && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Meal list */}
      {grouped.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽</Text>
          <Text style={styles.emptyTitle}>No meals found</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'Start scanning meals to see your history'
              : `No ${filter} meals logged yet`}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={grouped}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.mealCardWrapper}>
              <MealCard meal={item} compact />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONT.weights.black,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
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
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  filterRow: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryGlow,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.medium,
  },
  filterLabelActive: {
    color: COLORS.primary,
    fontWeight: FONT.weights.bold,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionHeader: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mealCardWrapper: {},
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT.sizes.xl,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
});
