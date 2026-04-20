import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';
import { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const progress = challenge.currentDays / challenge.targetDays;
  const isComplete = challenge.completed;

  return (
    <View style={[styles.container, isComplete && styles.containerComplete]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{challenge.icon}</Text>
        <View style={styles.info}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.description}>{challenge.description}</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{challenge.xpReward}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${Math.min(progress * 100, 100)}%`,
                backgroundColor: isComplete ? COLORS.primary : COLORS.cyan,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {challenge.currentDays}/{challenge.targetDays} days
        </Text>
      </View>

      {isComplete && (
        <View style={styles.completeBadge}>
          <Text style={styles.completeText}>✅ Completed!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  containerComplete: {
    borderColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: 2,
  },
  description: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
  },
  xpBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  xpText: {
    fontSize: FONT.sizes.md,
    color: COLORS.gold,
    fontWeight: FONT.weights.bold,
  },
  xpLabel: {
    fontSize: FONT.sizes.xs,
    color: COLORS.gold,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  progressText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    minWidth: 60,
    textAlign: 'right',
  },
  completeBadge: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primaryGlow,
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
    alignItems: 'center',
  },
  completeText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONT.weights.semibold,
  },
});
