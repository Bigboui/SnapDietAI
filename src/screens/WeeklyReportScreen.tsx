import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { aiService } from '../services/aiService';
import { useAppStore } from '../store/appStore';
import { WeeklyReport } from '../types';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';

export function WeeklyReportScreen() {
  const navigation = useNavigation();
  const { meals, challenges } = useAppStore();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    const weekStart = Date.now() - 7 * 86400000;
    const weekMeals = meals.filter((m) => m.timestamp >= weekStart);
    const report = await aiService.generateWeeklyReport(weekMeals, {
      calories: 4,
      protein: 3,
      water: 2,
    });
    setReport(report);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Report</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>🤖 AI generating your report...</Text>
        </View>
      ) : report ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <LinearGradient
            colors={['rgba(0,214,143,0.12)', 'transparent']}
            style={styles.heroCard}
          >
            <Text style={styles.heroEmoji}>📊</Text>
            <Text style={styles.heroTitle}>Your Week in Review</Text>
            <Text style={styles.heroSubtitle}>
              {report.weekStart} → {report.weekEnd}
            </Text>
          </LinearGradient>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Meals Logged', value: report.mealsLogged.toString(), color: COLORS.primary },
              { label: 'Avg Calories', value: report.averageCalories.toString(), color: COLORS.cyan },
              { label: 'Days On Track', value: `${report.daysOnTrack}/7`, color: COLORS.gold },
              { label: 'Water Goals Hit', value: `${report.waterGoalsDays}/7`, color: '#4FC3F7' },
              { label: 'Avg Protein', value: `${report.averageProtein}g`, color: '#FF6B8A' },
              { label: 'XP Earned', value: report.totalXPEarned.toString(), color: COLORS.gold },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* AI Insights */}
          <View style={[styles.insightCard, styles.winCard]}>
            <Text style={styles.insightLabel}>🏆 Biggest Win</Text>
            <Text style={styles.insightText}>{report.biggestWin}</Text>
          </View>

          <View style={[styles.insightCard, styles.issueCard]}>
            <Text style={styles.insightLabel}>⚠️ Biggest Opportunity</Text>
            <Text style={styles.insightText}>{report.biggestIssue}</Text>
          </View>

          <View style={[styles.insightCard, styles.recommendCard]}>
            <Text style={styles.insightLabel}>🤖 AI Recommendation</Text>
            <Text style={styles.insightText}>{report.recommendation}</Text>
          </View>

          {/* Challenge recap */}
          <View style={styles.challengeRecap}>
            <Text style={styles.sectionTitle}>Weekly Challenges</Text>
            {challenges.map((c) => (
              <View key={c.id} style={styles.challengeRow}>
                <Text style={styles.challengeIcon}>{c.icon}</Text>
                <Text style={styles.challengeName}>{c.title}</Text>
                <Text style={[styles.challengeProgress, { color: c.completed ? COLORS.primary : COLORS.secondaryText }]}>
                  {c.currentDays}/{c.targetDays}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  backBtnText: { color: COLORS.white, fontSize: 20, fontWeight: FONT.weights.bold },
  headerTitle: { fontSize: FONT.sizes.lg, color: COLORS.white, fontWeight: FONT.weights.bold },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { fontSize: FONT.sizes.md, color: COLORS.secondaryText },
  content: { padding: SPACING.lg, paddingBottom: 80 },
  heroCard: {
    alignItems: 'center', borderRadius: RADIUS.xl, padding: SPACING.xl,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(0,214,143,0.2)',
  },
  heroEmoji: { fontSize: 48, marginBottom: SPACING.md },
  heroTitle: { fontSize: FONT.sizes.xxl, color: COLORS.white, fontWeight: FONT.weights.black, marginBottom: 4 },
  heroSubtitle: { fontSize: FONT.sizes.sm, color: COLORS.secondaryText },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: {
    flex: 1, minWidth: '30%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: FONT.sizes.xl, fontWeight: FONT.weights.black },
  statLabel: { fontSize: FONT.sizes.xs, color: COLORS.secondaryText, marginTop: 2, textAlign: 'center' },
  insightCard: {
    borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1,
  },
  winCard: { backgroundColor: 'rgba(0,214,143,0.08)', borderColor: 'rgba(0,214,143,0.3)' },
  issueCard: { backgroundColor: 'rgba(255,184,0,0.08)', borderColor: 'rgba(255,184,0,0.3)' },
  recommendCard: { backgroundColor: 'rgba(78,205,196,0.08)', borderColor: 'rgba(78,205,196,0.3)' },
  insightLabel: { fontSize: FONT.sizes.md, color: COLORS.white, fontWeight: FONT.weights.bold, marginBottom: SPACING.sm },
  insightText: { fontSize: FONT.sizes.md, color: COLORS.secondaryText, lineHeight: 24 },
  challengeRecap: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: FONT.sizes.lg, color: COLORS.white, fontWeight: FONT.weights.bold, marginBottom: SPACING.md },
  challengeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  challengeIcon: { fontSize: 22 },
  challengeName: { flex: 1, fontSize: FONT.sizes.md, color: COLORS.white },
  challengeProgress: { fontSize: FONT.sizes.md, fontWeight: FONT.weights.bold },
});
