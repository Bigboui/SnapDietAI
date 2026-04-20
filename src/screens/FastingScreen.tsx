import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppStore } from '../store/appStore';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';
import { FastingSession } from '../types';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PROTOCOLS: { id: FastingSession['protocol']; label: string; desc: string; emoji: string; hours: number }[] = [
  { id: '16:8', label: '16:8', desc: 'Fast 16h, eat in 8h window', emoji: '⏰', hours: 16 },
  { id: '18:6', label: '18:6', desc: 'Fast 18h, eat in 6h window', emoji: '🕐', hours: 18 },
  { id: '20:4', label: '20:4', desc: 'Fast 20h, eat in 4h window', emoji: '⚡', hours: 20 },
  { id: '24h', label: '24 Hour', desc: 'Full day fast', emoji: '🌟', hours: 24 },
  { id: '5:2', label: '5:2', desc: '500 cal x2 days per week', emoji: '📅', hours: 20 },
];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function FastingScreen() {
  const navigation = useNavigation<Nav>();
  const { activeFasting, startFasting, endFasting, subscription, setShowPaywall } = useAppStore();
  const [selectedProtocol, setSelectedProtocol] = useState<typeof PROTOCOLS[0]>(PROTOCOLS[0]!);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeFasting) {
      const update = () => {
        const elapsedSec = Math.floor((Date.now() - activeFasting.startTime) / 1000);
        setElapsed(elapsedSec);
      };
      update();
      intervalRef.current = setInterval(update, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeFasting]);

  const handleStart = () => {
    if (subscription.tier === 'free') {
      setShowPaywall(true, 'Fasting Timer');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const session: FastingSession = {
      startTime: Date.now(),
      endTime: null,
      targetHours: selectedProtocol.hours,
      protocol: selectedProtocol.id,
      completed: false,
    };
    startFasting(session);
  };

  const handleStop = () => {
    Alert.alert(
      'End Fast?',
      'Are you sure you want to end your fasting session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Fast',
          style: 'destructive',
          onPress: () => {
            endFasting();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const targetSeconds = selectedProtocol.hours * 3600;
  const activeTargetSeconds = activeFasting ? activeFasting.targetHours * 3600 : targetSeconds;
  const progress = activeFasting ? Math.min(elapsed / activeTargetSeconds, 1) : 0;
  const remaining = Math.max(activeTargetSeconds - elapsed, 0);
  const isComplete = progress >= 1;

  const getPhase = () => {
    if (!activeFasting) return null;
    if (elapsed < 4 * 3600) return { label: 'Fed State', color: COLORS.gold, desc: 'Body using glucose' };
    if (elapsed < 8 * 3600) return { label: 'Post-Absorptive', color: COLORS.cyan, desc: 'Liver glycogen depleting' };
    if (elapsed < 16 * 3600) return { label: 'Gluconeogenesis', color: COLORS.primary, desc: 'Fat burning beginning' };
    return { label: 'Ketosis', color: '#9B59B6', desc: 'Deep fat burning mode 🔥' };
  };

  const phase = getPhase();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>⏱ Fasting Timer</Text>

        {/* Active fast */}
        {activeFasting ? (
          <View style={styles.activeSection}>
            {/* Timer circle */}
            <View style={styles.timerContainer}>
              <View style={[styles.timerOuter, { borderColor: isComplete ? COLORS.primary : COLORS.cyan }]}>
                <View style={styles.timerInner}>
                  <Text style={styles.timerLabel}>
                    {isComplete ? '🎉 COMPLETE!' : 'FASTING'}
                  </Text>
                  <Text style={[styles.timerTime, { color: isComplete ? COLORS.primary : COLORS.white }]}>
                    {formatDuration(elapsed)}
                  </Text>
                  <Text style={styles.timerTarget}>
                    {isComplete ? 'Goal reached!' : `${formatDuration(remaining)} remaining`}
                  </Text>
                </View>
              </View>

              {/* Progress ring visual */}
              <View style={styles.progressPercent}>
                <Text style={styles.progressPercentText}>{Math.round(progress * 100)}%</Text>
                <Text style={styles.progressPercentLabel}>complete</Text>
              </View>
            </View>

            {/* Phase */}
            {phase && (
              <View style={[styles.phaseCard, { borderColor: `${phase.color}50` }]}>
                <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
                <View>
                  <Text style={[styles.phaseLabel, { color: phase.color }]}>{phase.label}</Text>
                  <Text style={styles.phaseDesc}>{phase.desc}</Text>
                </View>
              </View>
            )}

            {/* Benefits timeline */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>Fasting Benefits Timeline</Text>
              {[
                { h: 4, label: 'Insulin levels drop', done: elapsed >= 4 * 3600 },
                { h: 8, label: 'Fat burning begins', done: elapsed >= 8 * 3600 },
                { h: 12, label: 'Growth hormone rises', done: elapsed >= 12 * 3600 },
                { h: 16, label: 'Autophagy activates', done: elapsed >= 16 * 3600 },
                { h: 24, label: 'Deep cellular repair', done: elapsed >= 24 * 3600 },
              ].map((b) => (
                <View key={b.h} style={styles.benefitRow}>
                  <Text style={[styles.benefitCheck, { color: b.done ? COLORS.primary : COLORS.border }]}>
                    {b.done ? '✓' : '○'}
                  </Text>
                  <Text style={[styles.benefitText, { color: b.done ? COLORS.white : COLORS.secondaryText }]}>
                    {b.h}h — {b.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Stop button */}
            <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
              <Text style={styles.stopBtnText}>⏹ End Fast</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Protocol selector */}
            <Text style={styles.sectionTitle}>Choose Protocol</Text>
            {PROTOCOLS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.protocolCard,
                  selectedProtocol.id === p.id && styles.protocolCardActive,
                ]}
                onPress={() => {
                  setSelectedProtocol(p);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={styles.protocolEmoji}>{p.emoji}</Text>
                <View style={styles.protocolInfo}>
                  <Text style={[styles.protocolLabel, selectedProtocol.id === p.id && styles.protocolLabelActive]}>
                    {p.label}
                  </Text>
                  <Text style={styles.protocolDesc}>{p.desc}</Text>
                </View>
                {selectedProtocol.id === p.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Start CTA */}
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleStart}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#4ECDC4', '#2980B9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startBtnGradient}
              >
                <Text style={styles.startBtnText}>
                  {subscription.tier === 'free' ? '🔒 Start Fast (Pro)' : '▶ Start Fast'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Info card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>ℹ️ About Intermittent Fasting</Text>
              <Text style={styles.infoText}>
                Intermittent fasting can improve insulin sensitivity, promote fat burning, and support cellular repair. Always consult your doctor before starting.
              </Text>
            </View>
          </View>
        )}

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
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONT.weights.black,
    marginBottom: SPACING.lg,
  },
  activeSection: {
    gap: SPACING.md,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  timerOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  timerInner: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.bold,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  timerTime: {
    fontSize: 44,
    fontWeight: FONT.weights.black,
    fontVariant: ['tabular-nums'],
  },
  timerTarget: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginTop: SPACING.sm,
  },
  progressPercent: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: COLORS.cyan,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    alignItems: 'center',
  },
  progressPercentText: {
    color: COLORS.white,
    fontWeight: FONT.weights.black,
    fontSize: FONT.sizes.lg,
  },
  progressPercentLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
  },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  phaseLabel: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.bold,
  },
  phaseDesc: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  benefitsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  benefitsTitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  benefitCheck: {
    fontSize: 16,
    fontWeight: FONT.weights.bold,
    width: 20,
  },
  benefitText: {
    fontSize: FONT.sizes.md,
  },
  stopBtn: {
    backgroundColor: 'rgba(255,71,87,0.15)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  stopBtnText: {
    color: COLORS.red,
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.bold,
  },
  sectionTitle: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.md,
  },
  protocolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  protocolCardActive: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(78,205,196,0.05)',
  },
  protocolEmoji: {
    fontSize: 28,
  },
  protocolInfo: {
    flex: 1,
  },
  protocolLabel: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  protocolLabelActive: {
    color: COLORS.cyan,
  },
  protocolDesc: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: COLORS.cyan,
    fontWeight: FONT.weights.bold,
  },
  startBtn: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  startBtnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: FONT.sizes.lg,
    fontWeight: FONT.weights.bold,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    lineHeight: 22,
  },
});
