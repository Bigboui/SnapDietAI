import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function ActionButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  size = 'md',
}: ActionButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const sizeStyles = {
    sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
    md: { paddingVertical: 14, paddingHorizontal: SPACING.lg },
    lg: { paddingVertical: 18, paddingHorizontal: SPACING.xl },
  };

  const textSizes = {
    sm: FONT.sizes.sm,
    md: FONT.sizes.md,
    lg: FONT.sizes.lg,
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={disabled || loading}
        style={[styles.base, style, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={['#00D68F', '#00B07A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={[styles.primaryText, { fontSize: textSizes[size] }, textStyle]}>
              {icon && `${icon}  `}{title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: {
      container: styles.secondary,
      text: styles.secondaryText,
    },
    ghost: {
      container: styles.ghost,
      text: styles.ghostText,
    },
    danger: {
      container: styles.danger,
      text: styles.dangerText,
    },
  };

  const vs = variantStyles[variant as 'secondary' | 'ghost' | 'danger'];

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[styles.base, vs.container, sizeStyles[size], style, disabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="small" />
      ) : (
        <Text style={[vs.text, { fontSize: textSizes[size] }, textStyle]}>
          {icon && `${icon}  `}{title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryText: {
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    letterSpacing: 0.5,
  },
  secondary: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: COLORS.white,
    fontWeight: FONT.weights.semibold,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: COLORS.primary,
    fontWeight: FONT.weights.semibold,
  },
  danger: {
    backgroundColor: 'rgba(255,71,87,0.15)',
    borderWidth: 1,
    borderColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: {
    color: COLORS.red,
    fontWeight: FONT.weights.semibold,
  },
  disabled: {
    opacity: 0.4,
  },
});
