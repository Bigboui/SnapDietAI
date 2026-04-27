import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';
import { useAppStore } from '../store/appStore';
import { purchaseService, PRODUCT_DETAILS } from '../services/purchaseService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PRO_FEATURES = [
  { icon: '📷', title: 'Unlimited Scans', desc: 'Scan as many meals as you want' },
  { icon: '🔍', title: 'Barcode Scanner', desc: 'Scan packaged foods instantly' },
  { icon: '💧', title: 'Hydration Tracker', desc: 'Track water intake daily' },
  { icon: '⏱', title: 'Fasting Timer', desc: 'Multiple fasting protocols' },
  { icon: '📊', title: 'Weekly Reports', desc: 'AI-powered nutrition insights' },
  { icon: '🛒', title: 'Grocery List', desc: 'Smart shopping assistant' },
];

const PREMIUM_EXTRAS = [
  { icon: '🤖', title: 'AI Nutrition Coach', desc: 'Personal AI coach available 24/7' },
  { icon: '😊', title: 'Mood & Energy Tracking', desc: 'Understand food-mood connections' },
  { icon: '🍽', title: 'Custom Meal Plans', desc: 'Personalized weekly plans' },
  { icon: '👨‍👩‍👧', title: 'Family Mode', desc: 'Track nutrition for the whole family' },
  { icon: '📸', title: 'Progress Photos', desc: 'Visual transformation tracker' },
];

export function PaywallModal() {
  const { showPaywall, paywallFeature, setShowPaywall, setSubscription } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<string>('flashdiet_pro_yearly');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pro' | 'premium'>('pro');

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showPaywall) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPaywall]);

  const handlePurchase = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const subscription = await purchaseService.purchaseProduct(selectedPlan);
      if (subscription) {
        setSubscription(subscription);
        setShowPaywall(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('🎉 Welcome to Pro!', 'You now have access to all premium features.');
      }
    } catch (e) {
      Alert.alert('Purchase Failed', 'Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const proPlans = PRODUCT_DETAILS.filter((p) => p.tier === 'pro');
  const premiumPlans = PRODUCT_DETAILS.filter((p) => p.tier === 'premium');
  const currentPlans = activeTab === 'pro' ? proPlans : premiumPlans;
  const currentFeatures = activeTab === 'pro' ? PRO_FEATURES : [...PRO_FEATURES, ...PREMIUM_EXTRAS];

  return (
    <Modal visible={showPaywall} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowPaywall(false)} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient
          colors={['#1A1A2E', '#0A0A0F']}
          style={styles.gradient}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPaywall(false)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.crownContainer}>
              <Text style={styles.crown}>👑</Text>
            </View>
            <Text style={styles.headerTitle}>Upgrade FlashDiet</Text>
            <Text style={styles.headerSubtitle}>
              {paywallFeature
                ? `Unlock ${paywallFeature} and much more`
                : 'Unlock your full nutrition potential'}
            </Text>
          </View>

          {/* Tab selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pro' && styles.tabActive]}
              onPress={() => {
                setActiveTab('pro');
                setSelectedPlan('flashdiet_pro_yearly');
              }}
            >
              <Text style={[styles.tabText, activeTab === 'pro' && styles.tabTextActive]}>
                Pro $14.99/mo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'premium' && styles.tabActive]}
              onPress={() => {
                setActiveTab('premium');
                setSelectedPlan('flashdiet_premium_yearly');
              }}
            >
              <Text style={[styles.tabText, activeTab === 'premium' && styles.tabTextActive]}>
                Premium $29.99/mo
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Plan selector */}
            <View style={styles.plansRow}>
              {currentPlans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedPlan(plan.id);
                    Haptics.selectionAsync();
                  }}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>BEST VALUE</Text>
                    </View>
                  )}
                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={[styles.planPrice, selectedPlan === plan.id && styles.planPriceSelected]}>
                    {plan.price}
                  </Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                  {plan.priceAnnual && (
                    <Text style={styles.planAnnual}>{plan.priceAnnual}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>
                {activeTab === 'pro' ? 'Everything in Pro' : 'Everything included'}
              </Text>
              {currentFeatures.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* CTA */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handlePurchase}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={activeTab === 'premium' ? ['#E040FB', '#9C27B0'] : ['#00D68F', '#00B07A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Processing...' : `Start ${activeTab === 'pro' ? 'Pro' : 'Premium'} — Free Trial`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.legalText}>
              Cancel anytime. Auto-renews. By continuing you agree to our Terms.
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.92,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  closeBtn: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.md,
    width: 32,
    height: 32,
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: COLORS.secondaryText,
    fontSize: 14,
    fontWeight: FONT.weights.bold,
  },
  crownContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,184,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,184,0,0.4)',
  },
  crown: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: FONT.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONT.weights.black,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  tabActive: {
    backgroundColor: COLORS.surface,
  },
  tabText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    fontWeight: FONT.weights.medium,
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  plansRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0,214,143,0.05)',
  },
  popularBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginBottom: SPACING.sm,
  },
  popularText: {
    fontSize: 9,
    color: '#000',
    fontWeight: FONT.weights.black,
    letterSpacing: 1,
  },
  savingsBadge: {
    backgroundColor: COLORS.primaryGlow,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  savingsText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: FONT.weights.bold,
  },
  planTitle: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: FONT.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONT.weights.black,
  },
  planPriceSelected: {
    color: COLORS.primary,
  },
  planPeriod: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
  },
  planAnnual: {
    fontSize: FONT.sizes.xs,
    color: COLORS.mutedText,
    marginTop: 2,
  },
  featuresSection: {
    gap: SPACING.md,
  },
  featuresTitle: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIcon: {
    fontSize: 24,
    width: 32,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.semibold,
  },
  featureDesc: {
    fontSize: FONT.sizes.xs,
    color: COLORS.secondaryText,
    marginTop: 1,
  },
  checkmark: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: FONT.weights.bold,
  },
  ctaContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ctaButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
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
