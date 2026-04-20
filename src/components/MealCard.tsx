import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';
import { Meal } from '../types';

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
  compact?: boolean;
}

function getHealthColor(score: number): string {
  if (score >= 80) return COLORS.primary;
  if (score >= 60) return COLORS.gold;
  if (score >= 40) return '#FF8C00';
  return COLORS.red;
}

function getMealTypeEmoji(type: string): string {
  switch (type) {
    case 'breakfast': return '🌅';
    case 'lunch': return '☀️';
    case 'dinner': return '🌙';
    case 'snack': return '🍎';
    default: return '🍽️';
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MealCard({ meal, onPress, compact = false }: MealCardProps) {
  const healthColor = getHealthColor(meal.healthScore);

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.compactLeft}>
          <Text style={styles.mealTypeEmoji}>{getMealTypeEmoji(meal.mealType)}</Text>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName} numberOfLines={1}>{meal.name}</Text>
            <Text style={styles.compactTime}>{formatTime(meal.timestamp)}</Text>
          </View>
        </View>
        <View style={styles.compactRight}>
          <Text style={styles.compactCalories}>{meal.calories}</Text>
          <Text style={styles.compactUnit}>kcal</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {meal.imageUrl && (
        <Image source={{ uri: meal.imageUrl }} style={styles.image} />
      )}
      {!meal.imageUrl && (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderEmoji}>{getMealTypeEmoji(meal.mealType)}</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{meal.name}</Text>
          <View style={[styles.healthBadge, { borderColor: healthColor }]}>
            <Text style={[styles.healthScore, { color: healthColor }]}>
              {meal.healthScore}
            </Text>
          </View>
        </View>
        <View style={styles.macros}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.calories}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.protein}g</Text>
            <Text style={styles.macroLabel}>protein</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.carbs}g</Text>
            <Text style={styles.macroLabel}>carbs</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.fat}g</Text>
            <Text style={styles.macroLabel}>fat</Text>
          </View>
        </View>
        <Text style={styles.time}>
          {getMealTypeEmoji(meal.mealType)} {meal.mealType} · {formatTime(meal.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderEmoji: {
    fontSize: 40,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    flex: 1,
    marginRight: SPACING.sm,
  },
  healthBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthScore: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.bold,
  },
  macros: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  macroLabel: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  macroDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  time: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealTypeEmoji: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.semibold,
  },
  compactTime: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  compactCalories: {
    fontSize: FONT.sizes.xl,
    color: COLORS.primary,
    fontWeight: FONT.weights.bold,
  },
  compactUnit: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
  },
});
