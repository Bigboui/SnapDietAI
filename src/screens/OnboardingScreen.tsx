import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '../store/appStore';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';
import { User } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', emoji: '⚖️', desc: 'Burn fat, get lean' },
  { id: 'maintain', label: 'Maintain Weight', emoji: '🎯', desc: 'Stay healthy & balanced' },
  { id: 'gain_muscle', label: 'Gain Muscle', emoji: '💪', desc: 'Build strength & mass' },
  { id: 'eat_healthier', label: 'Eat Healthier', emoji: '🥗', desc: 'Better food choices' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { id: 'light', label: 'Light', desc: '1–3 days/week' },
  { id: 'moderate', label: 'Moderate', desc: '3–5 days/week' },
  { id: 'active', label: 'Active', desc: '6–7 days/week' },
  { id: 'very_active', label: 'Very Active', desc: 'Athlete level' },
];

function calculateCalorieTarget(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activity: string,
  goal: string
): { calories: number; protein: number; carbs: number; fat: number } {
  // Mifflin-St Jeor BMR
  let bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[activity] ?? 1.55);

  let calories = tdee;
  if (goal === 'lose_weight') calories = tdee - 500;
  if (goal === 'gain_muscle') calories = tdee + 300;

  calories = Math.round(calories);

  const protein = Math.round(weight * 2); // 2g per kg
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs, fat };
}

export function OnboardingScreen() {
  const { setUser, setIsOnboarded } = useAppStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [goal, setGoal] = useState<string>('lose_weight');
  const [activity, setActivity] = useState<string>('moderate');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = 5;
  const progress = (step + 1) / totalSteps;

  const goNext = () => {
    if (step < totalSteps - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const handleFinish = () => {
    const w = parseFloat(weight) || 75;
    const h = parseFloat(height) || 170;
    const a = parseInt(age) || 25;
    const targets = calculateCalorieTarget(w, h, a, gender, activity, goal);

    const user: User = {
      id: Date.now().toString(),
      name: name || 'Champion',
      age: a,
      weight: w,
      height: h,
      gender,
      activityLevel: activity as User['activityLevel'],
      goal: goal as User['goal'],
      calorieTarget: targets.calories,
      proteinTarget: targets.protein,
      carbTarget: targets.carbs,
      fatTarget: targets.fat,
      waterTarget: Math.round(w * 35), // 35ml per kg
      createdAt: Date.now(),
      onboardingComplete: true,
    };

    setUser(user);
    setIsOnboarded(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={styles.stepTitle}>Welcome to{'\n'}SnapDiet AI</Text>
            <Text style={styles.stepSubtitle}>
              Your AI-powered nutrition companion. Snap meals, track progress, and level up your health.
            </Text>
            <View style={styles.featuresList}>
              {[
                '📷 Instant AI meal analysis',
                '🏆 Gamified rank progression',
                '💪 Personalized nutrition targets',
                '🤖 AI nutrition coaching',
              ].map((f) => (
                <View key={f} style={styles.featureItem}>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 1:
        return (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>🧑</Text>
              <Text style={styles.stepTitle}>What's your name?</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={COLORS.mutedText}
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={30}
              />
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {(['male', 'female', 'other'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderBtnText, gender === g && styles.genderBtnTextActive]}>
                      {g === 'male' ? '👨 Male' : g === 'female' ? '👩 Female' : '🧑 Other'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </KeyboardAvoidingView>
        );

      case 2:
        return (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>📏</Text>
              <Text style={styles.stepTitle}>Your body stats</Text>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 28"
                placeholderTextColor={COLORS.mutedText}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 75"
                placeholderTextColor={COLORS.mutedText}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 175"
                placeholderTextColor={COLORS.mutedText}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                maxLength={5}
              />
            </View>
          </KeyboardAvoidingView>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={styles.stepTitle}>What's your goal?</Text>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[styles.optionCard, goal === g.id && styles.optionCardActive]}
                onPress={() => {
                  setGoal(g.id);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={styles.optionEmoji}>{g.emoji}</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, goal === g.id && styles.optionTitleActive]}>
                    {g.label}
                  </Text>
                  <Text style={styles.optionDesc}>{g.desc}</Text>
                </View>
                {goal === g.id && <Text style={styles.optionCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>⚡</Text>
            <Text style={styles.stepTitle}>Activity level</Text>
            {ACTIVITY_LEVELS.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.optionCard, activity === a.id && styles.optionCardActive]}
                onPress={() => {
                  setActivity(a.id);
                  Haptics.selectionAsync();
                }}
              >
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, activity === a.id && styles.optionTitleActive]}>
                    {a.label}
                  </Text>
                  <Text style={styles.optionDesc}>{a.desc}</Text>
                </View>
                {activity === a.id && <Text style={styles.optionCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#0A0A0F']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          {step > 0 && (
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
          )}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.stepCounter}>{step + 1}/{totalSteps}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            {renderStep()}
          </Animated.View>
        </ScrollView>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={step === totalSteps - 1 ? handleFinish : goNext}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00D68F', '#00B07A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>
                {step === 0
                  ? "Let's Go! 🚀"
                  : step === totalSteps - 1
                  ? 'Start My Journey 🏆'
                  : 'Continue →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {step === 0 && (
            <Text style={styles.legalText}>
              By continuing you agree to our Terms of Service & Privacy Policy
            </Text>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: 18,
  },
  backBtnText: {
    color: COLORS.white,
    fontSize: 20,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  stepCounter: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.medium,
    minWidth: 28,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  stepContent: {
    paddingTop: SPACING.lg,
  },
  stepEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT.sizes.xxxl,
    color: COLORS.white,
    fontWeight: FONT.weights.black,
    marginBottom: SPACING.md,
    lineHeight: 42,
  },
  stepSubtitle: {
    fontSize: FONT.sizes.lg,
    color: COLORS.secondaryText,
    lineHeight: 26,
    marginBottom: SPACING.xl,
  },
  featuresList: {
    gap: SPACING.sm,
  },
  featureItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureText: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.medium,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.medium,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  genderBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryGlow,
  },
  genderBtnText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.medium,
  },
  genderBtnTextActive: {
    color: COLORS.primary,
    fontWeight: FONT.weights.bold,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryGlow,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.semibold,
  },
  optionTitleActive: {
    color: COLORS.primary,
  },
  optionDesc: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  optionCheck: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: FONT.weights.bold,
  },
  ctaContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  ctaButton: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  legalText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.mutedText,
    textAlign: 'center',
  },
});
