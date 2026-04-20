import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  emoji: string;
}

export function MacroBar({ label, current, unit, target, color, emoji }: MacroBarProps) {
  const progress = Math.min(current / Math.max(target, 1), 1);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 900,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const isOver = current > target;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={[styles.value, isOver && { color: COLORS.red }]}>
          {Math.round(current)}{unit}
          <Text style={styles.target}> / {target}{unit}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: isOver ? COLORS.red : color,
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.remaining}>
        {isOver
          ? `${Math.round(current - target)}${unit} over`
          : `${Math.round(target - current)}${unit} remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.semibold,
  },
  value: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  target: {
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.regular,
    fontSize: FONT.sizes.sm,
  },
  track: {
    height: 8,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  remaining: {
    fontSize: FONT.sizes.xs,
    color: COLORS.mutedText,
    marginTop: 3,
  },
});
