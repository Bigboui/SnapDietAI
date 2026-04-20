import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppStore } from '../store/appStore';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';
import { NutritionAnalysis } from '../types';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'NutritionResult'>;

function ScoreRing({
  score,
  label,
  color,
  size = 72,
}: {
  score: number;
  label: string;
  color: string;
  size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 6,
            borderColor: COLORS.elevated,
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 6,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: progress > 0.25 ? color : 'transparent',
            borderBottomColor: progress > 0.5 ? color : 'transparent',
            borderLeftColor: progress > 0.75 ? color : 'transparent',
            transform: [{ rotate: '-45deg' }],
          }}
        />
        <Text style={{ fontSize: 18, color, fontWeight: '900' }}>{score}</Text>
      </View>
      <Text style={{ fontSize: 11, color: COLORS.secondaryText, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

function MacroChip({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <View style={[styles.macroChip, { borderColor: `${color}40` }]}>
      <Text style={[styles.macroChipValue, { color }]}>{Math.round(value)}{unit}</Text>
      <Text style={styles.macroChipLabel}>{label}</Text>
    </View>
  );
}

export function NutritionResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { addMeal } = useAppStore();

  const analysis: NutritionAnalysis = JSON.parse(route.params.analysisJson);
  const { meal, suggestions, warnings, healthHighlights } = analysis;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogMeal = () => {
    addMeal(meal);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '✅ Meal Logged!',
      `${meal.name} added to your log. +50 XP earned!`,
      [{ text: 'Great!', onPress: () => navigation.navigate('MainTabs') }]
    );
  };

  const getHealthLabel = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: COLORS.primary };
    if (score >= 70) return { label: 'Good', color: COLORS.cyan };
    if (score >= 50) return { label: 'Fair', color: COLORS.gold };
    if (score >= 30) return { label: 'Poor', color: '#FF8C00' };
    return { label: 'Unhealthy', color: COLORS.red };
  };

  const getGlycemicLabel = (gi: number) => {
    if (gi <= 35) return { label: 'Low GI', color: COLORS.primary };
    if (gi <= 55) return { label: 'Medium GI', color: COLORS.gold };
    return { label: 'High GI', color: COLORS.red };
  };

  const getProcessingLabel = (score: number) => {
    if (score <= 20) return { label: 'Whole Food', color: COLORS.primary };
    if (score <= 40) return { label: 'Minimally Processed', color: COLORS.cyan };
    if (score <= 60) return { label: 'Processed', color: COLORS.gold };
    return { label: 'Ultra-Processed', color: COLORS.red };
  };

  const healthInfo = getHealthLabel(meal.healthScore);
  const glycemicInfo = getGlycemicLabel(meal.glycemicIndex);
  const processingInfo = getProcessingLabel(meal.processingScore);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.ScrollView
        style={[styles.scroll, { opacity: fadeAnim }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nutrition Analysis</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Meal Image / Hero */}
        {meal.imageUrl ? (
          <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
        ) : (
          <View style={styles.mealImagePlaceholder}>
            <Text style={styles.mealImageEmoji}>🍽</Text>
          </View>
        )}

        {/* Meal name & health */}
        <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <View style={styles.healthTagRow}>
            <View style={[styles.healthTag, { backgroundColor: `${healthInfo.color}20`, borderColor: healthInfo.color }]}>
              <Text style={[styles.healthTagText, { color: healthInfo.color }]}>
                {healthInfo.label}
              </Text>
            </View>
            <Text style={styles.confidenceText}>AI Analysis • High Confidence</Text>
          </View>

          {/* Calorie hero */}
          <LinearGradient
            colors={['rgba(0,214,143,0.12)', 'transparent']}
            style={styles.calorieHero}
          >
            <Text style={styles.calorieValue}>{meal.calories}</Text>
            <Text style={styles.calorieUnit}>kcal</Text>
          </LinearGradient>
        </Animated.View>

        {/* Macros grid */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macronutrients</Text>
          <View style={styles.macroGrid}>
            <MacroChip label="Protein" value={meal.protein} unit="g" color="#FF6B8A" />
            <MacroChip label="Carbs" value={meal.carbs} unit="g" color={COLORS.gold} />
            <MacroChip label="Fat" value={meal.fat} unit="g" color={COLORS.cyan} />
            <MacroChip label="Fiber" value={meal.fiber} unit="g" color={COLORS.primary} />
            <MacroChip label="Sugar" value={meal.sugar} unit="g" color="#FF8C00" />
          </View>
        </View>

        {/* Score rings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Health Scores</Text>
          <View style={styles.scoresRow}>
            <ScoreRing score={meal.healthScore} label="Health Score" color={healthInfo.color} />
            <ScoreRing score={meal.glycemicIndex} label="Glycemic Index" color={glycemicInfo.color} />
            <ScoreRing score={meal.processingScore} label="Processing" color={processingInfo.color} />
          </View>
          <View style={styles.scoresLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: glycemicInfo.color }]} />
              <Text style={styles.legendText}>GI: {glycemicInfo.label}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: processingInfo.color }]} />
              <Text style={styles.legendText}>{processingInfo.label}</Text>
            </View>
          </View>
        </View>

        {/* Health Highlights */}
        {healthHighlights.length > 0 && (
          <View style={[styles.card, styles.highlightsCard]}>
            <Text style={styles.cardTitle}>✨ Health Highlights</Text>
            {healthHighlights.map((h, i) => (
              <Text key={i} style={styles.highlightText}>{h}</Text>
            ))}
          </View>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <View style={[styles.card, styles.warningsCard]}>
            <Text style={styles.cardTitle}>⚠️ Watch Out</Text>
            {warnings.map((w, i) => (
              <Text key={i} style={styles.warningText}>{w}</Text>
            ))}
          </View>
        )}

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <View style={[styles.card, styles.suggestionsCard]}>
            <Text style={styles.cardTitle}>🤖 AI Suggestions</Text>
            {suggestions.map((s, i) => (
              <View key={i} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* XP reward */}
        <View style={[styles.card, styles.xpCard]}>
          <Text style={styles.xpTitle}>🏆 Log This Meal</Text>
          <Text style={styles.xpSubtitle}>Earn +50 XP for logging your meal</Text>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity style={styles.discardBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logBtn} onPress={handleLogMeal}>
          <LinearGradient
            colors={['#00D68F', '#00B07A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logBtnGradient}
          >
            <Text style={styles.logBtnText}>✓ Log Meal  +50 XP</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: FONT.weights.bold,
  },
  headerTitle: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  mealImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  mealImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealImageEmoji: {
    fontSize: 64,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.md,
  },
  mealName: {
    fontSize: FONT.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONT.weights.black,
    marginBottom: SPACING.sm,
  },
  healthTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  healthTag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  healthTagText: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.bold,
  },
  confidenceText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
  },
  calorieHero: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  calorieValue: {
    fontSize: 56,
    color: COLORS.white,
    fontWeight: FONT.weights.black,
  },
  calorieUnit: {
    fontSize: FONT.sizes.xl,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.medium,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  macroChip: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  macroChipValue: {
    fontSize: FONT.sizes.xl,
    fontWeight: FONT.weights.black,
  },
  macroChipLabel: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  scoresLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
  },
  highlightsCard: {
    borderColor: 'rgba(0,214,143,0.3)',
    backgroundColor: 'rgba(0,214,143,0.05)',
  },
  warningsCard: {
    borderColor: 'rgba(255,71,87,0.3)',
    backgroundColor: 'rgba(255,71,87,0.05)',
  },
  suggestionsCard: {
    borderColor: 'rgba(78,205,196,0.3)',
    backgroundColor: 'rgba(78,205,196,0.05)',
  },
  highlightText: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  suggestionItem: {
    marginBottom: SPACING.sm,
  },
  suggestionText: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    lineHeight: 24,
  },
  xpCard: {
    borderColor: 'rgba(255,184,0,0.3)',
    backgroundColor: 'rgba(255,184,0,0.05)',
    alignItems: 'center',
  },
  xpTitle: {
    fontSize: FONT.sizes.xl,
    color: COLORS.gold,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.xs,
  },
  xpSubtitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.secondaryText,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  discardText: {
    color: COLORS.secondaryText,
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.semibold,
  },
  logBtn: {
    flex: 2,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  logBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logBtnText: {
    color: COLORS.white,
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.bold,
  },
});
