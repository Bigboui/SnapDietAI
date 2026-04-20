import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, getRankColor, getRankGlow } from '../constants/colors';
import { RANKS } from '../constants';
import { RankProgress } from '../types';
import { FONT } from '../constants';

interface RankRingProps {
  rankProgress: RankProgress;
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function RankRing({ rankProgress, size = 220 }: RankRingProps) {
  const { rank, totalXP, currentXP, streak } = rankProgress;

  const rankColor = getRankColor(rank);
  const rankGlow = getRankGlow(rank);

  const currentRankData = RANKS.find((r) => r.name === rank);
  const nextRankData = RANKS[RANKS.findIndex((r) => r.name === rank) + 1];

  const rankXPStart = currentRankData?.minXP ?? 0;
  const rankXPEnd = nextRankData?.minXP ?? currentRankData?.maxXP ?? 500;
  const rankXPRange = rankXPEnd - rankXPStart;
  const xpIntoRank = totalXP - rankXPStart;
  const progress = Math.min(xpIntoRank / rankXPRange, 1);
  const xpToNext = nextRankData ? rankXPEnd - totalXP : 0;

  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const animatedProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const animatedOffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const rankEmoji: Record<string, string> = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Diamond: '💎',
    Emerald: '💚',
    Champion: '👑',
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            backgroundColor: rankGlow,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* SVG Ring */}
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={rankColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={rank === 'Champion' ? '#FF6B6B' : rankColor} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.elevated}
          strokeWidth={10}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={10}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.center}>
        <Text style={styles.rankEmoji}>{rankEmoji[rank]}</Text>
        <Text style={[styles.rankText, { color: rankColor }]}>{rank.toUpperCase()}</Text>
        {nextRankData ? (
          <Text style={styles.xpText}>
            {xpToNext.toLocaleString()} XP to {nextRankData.name}
          </Text>
        ) : (
          <Text style={styles.xpText}>MAX RANK</Text>
        )}
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>🔥 {streak} day streak</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  rankText: {
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.black,
    letterSpacing: 3,
  },
  xpText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginTop: 4,
    fontWeight: FONT.weights.medium,
  },
  streakContainer: {
    marginTop: 8,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streakText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.white,
    fontWeight: FONT.weights.semibold,
  },
});
