import { Subscription, SubscriptionTier } from '../types';

// ─── RevenueCat Integration Ready ────────────────────────────────────────────
// Replace mock methods with real RevenueCat SDK calls when ready.
// Install: npx expo install react-native-purchases
// Configure: Purchases.configure({ apiKey: 'your_revenuecat_key' });

export const PRODUCTS = {
  PRO_MONTHLY: 'snapdiet_pro_monthly',
  PRO_YEARLY: 'snapdiet_pro_yearly',
  PREMIUM_MONTHLY: 'snapdiet_premium_monthly',
  PREMIUM_YEARLY: 'snapdiet_premium_yearly',
};

export const PRODUCT_DETAILS = [
  {
    id: PRODUCTS.PRO_MONTHLY,
    tier: 'pro' as SubscriptionTier,
    title: 'Pro Monthly',
    price: '$14.99',
    period: '/month',
    description: 'Unlimited scans, barcode scanner, hydration tracker & more',
    popular: false,
  },
  {
    id: PRODUCTS.PRO_YEARLY,
    tier: 'pro' as SubscriptionTier,
    title: 'Pro Annual',
    price: '$8.99',
    period: '/month',
    priceAnnual: '$107.88/year',
    description: 'Save 40% — everything in Pro, billed yearly',
    popular: true,
    savings: 'Save 40%',
  },
  {
    id: PRODUCTS.PREMIUM_MONTHLY,
    tier: 'premium' as SubscriptionTier,
    title: 'Premium Monthly',
    price: '$29.99',
    period: '/month',
    description: 'AI Coach, custom meal plans, family mode & progress photos',
    popular: false,
  },
  {
    id: PRODUCTS.PREMIUM_YEARLY,
    tier: 'premium' as SubscriptionTier,
    title: 'Premium Annual',
    price: '$19.99',
    period: '/month',
    priceAnnual: '$239.88/year',
    description: 'Save 33% — everything in Premium, billed yearly',
    popular: false,
    savings: 'Save 33%',
  },
];

class PurchaseService {
  // ─── Initialize RevenueCat ──────────────────────────────────────────────
  async initialize(): Promise<void> {
    // TODO: Initialize RevenueCat
    // const Purchases = require('react-native-purchases');
    // await Purchases.configure({ apiKey: Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY });
    console.log('PurchaseService initialized (mock mode)');
  }

  // ─── Get Available Packages ─────────────────────────────────────────────
  async getOfferings(): Promise<typeof PRODUCT_DETAILS> {
    // TODO: Replace with RevenueCat offerings
    // const offerings = await Purchases.getOfferings();
    // return offerings.current?.availablePackages ?? [];
    return PRODUCT_DETAILS;
  }

  // ─── Purchase Product ───────────────────────────────────────────────────
  async purchaseProduct(productId: string): Promise<Subscription | null> {
    // TODO: Replace with RevenueCat purchase
    // const { customerInfo } = await Purchases.purchasePackage(package);

    // Mock successful purchase
    const product = PRODUCT_DETAILS.find((p) => p.id === productId);
    if (!product) return null;

    const expiresAt = new Date();
    if (productId.includes('yearly')) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    return {
      tier: product.tier,
      expiresAt: expiresAt.getTime(),
      purchasedAt: Date.now(),
      productId,
    };
  }

  // ─── Restore Purchases ──────────────────────────────────────────────────
  async restorePurchases(): Promise<Subscription | null> {
    // TODO: Replace with RevenueCat restore
    // const customerInfo = await Purchases.restorePurchases();
    // return parseCustomerInfo(customerInfo);
    return null;
  }

  // ─── Check Active Subscription ──────────────────────────────────────────
  async getActiveSubscription(): Promise<Subscription | null> {
    // TODO: Replace with RevenueCat customer info check
    // const customerInfo = await Purchases.getCustomerInfo();
    return null;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────
  isSubscriptionActive(subscription: Subscription): boolean {
    if (subscription.tier === 'free') return true;
    if (!subscription.expiresAt) return false;
    return subscription.expiresAt > Date.now();
  }

  canAccessFeature(
    feature: 'unlimited_scans' | 'barcode' | 'ai_coach' | 'meal_plans' | 'family',
    tier: SubscriptionTier
  ): boolean {
    const proFeatures = ['unlimited_scans', 'barcode'];
    const premiumFeatures = ['ai_coach', 'meal_plans', 'family'];

    if (tier === 'premium') return true;
    if (tier === 'pro') return proFeatures.includes(feature);
    return false;
  }
}

export const purchaseService = new PurchaseService();
