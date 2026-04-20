import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';

interface WaterTrackerProps {
  current: number; // ml
  target: number; // ml
  onAdd: (amount: number) => void;
}

const QUICK_ADD = [150, 250, 350, 500];

export function WaterTracker({ current, target, onAdd }: WaterTrackerProps) {
  const progress = Math.min(current / target, 1);
  const cups = Math.floor(current / 250);
  const targetCups = Math.ceil(target / 250);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>💧 Hydration</Text>
          <Text style={styles.subtitle}>
            {(current / 1000).toFixed(1)}L of {(target / 1000).toFixed(1)}L
          </Text>
        </View>
        <View style={styles.cupCount}>
          <Text style={styles.cupNumber}>{cups}</Text>
          <Text style={styles.cupLabel}>/ {targetCups} cups</Text>
        </View>
      </View>

      {/* Wave progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
      </View>

      {/* Cups visualization */}
      <View style={styles.cupsRow}>
        {Array.from({ length: Math.min(targetCups, 8) }).map((_, i) => (
          <View
            key={i}
            style={[styles.cup, i < cups && styles.cupFilled]}
          >
            <Text style={styles.cupEmoji}>{i < cups ? '🥤' : '🫙'}</Text>
          </View>
        ))}
      </View>

      {/* Quick add buttons */}
      <View style={styles.quickAddRow}>
        {QUICK_ADD.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles.quickAddBtn}
            onPress={() => onAdd(amount)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickAddText}>+{amount}ml</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  subtitle: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  cupCount: {
    alignItems: 'flex-end',
  },
  cupNumber: {
    fontSize: FONT.sizes.xxl,
    color: COLORS.cyan,
    fontWeight: FONT.weights.black,
  },
  cupLabel: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
  },
  progressTrack: {
    height: 14,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.cyan,
    borderRadius: RADIUS.full,
  },
  progressPercent: {
    fontSize: FONT.sizes.xs,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
  },
  cupsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  cup: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cupFilled: {
    backgroundColor: 'rgba(78,205,196,0.15)',
    borderColor: COLORS.cyan,
  },
  cupEmoji: {
    fontSize: 18,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickAddBtn: {
    flex: 1,
    backgroundColor: 'rgba(78,205,196,0.1)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.3)',
  },
  quickAddText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.cyan,
    fontWeight: FONT.weights.semibold,
  },
});
