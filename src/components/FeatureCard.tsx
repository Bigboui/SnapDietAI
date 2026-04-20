import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  color?: string;
  onPress?: () => void;
  locked?: boolean;
  badge?: string;
}

export function FeatureCard({
  icon,
  title,
  subtitle,
  value,
  color = COLORS.primary,
  onPress,
  locked = false,
  badge,
}: FeatureCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: locked ? COLORS.border : `${color}40` }]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Text style={styles.icon}>{locked ? '🔒' : icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {value && (
        <Text style={[styles.value, { color }]}>{value}</Text>
      )}
      {badge && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {onPress && !locked && (
        <Text style={styles.arrow}>›</Text>
      )}
      {locked && (
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.semibold,
  },
  subtitle: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  value: {
    fontSize: FONT.sizes.lg,
    fontWeight: FONT.weights.bold,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  arrow: {
    fontSize: 22,
    color: COLORS.secondaryText,
    marginLeft: SPACING.xs,
  },
  proBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  proBadgeText: {
    fontSize: 9,
    color: '#000',
    fontWeight: FONT.weights.black,
    letterSpacing: 1,
  },
});
