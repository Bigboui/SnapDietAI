import { Platform } from 'react-native';
import { Subscription, SubscriptionTier } from '../types';

// ─── YOUR REVENUECAT KEYS ─────────────────────────────────────────────────────
// Replace these with your actual keys from app.revenuecat.com
const RC_IOS_KEY = process.env.REVENUECAT_IOS_KEY ?? 'appl_REPLACE_WITH_YOUR_IOS_KEY';
const RC_ANDROID_KEY = process.env.REVENUECAT_ANDROID_KEY ?? 'goog_REPLACE_WITH_YOUR_ANDROID_KEY';

export const PRODUCTS = {
  PRO_MONTHLY: 'flashdiet_pro_monthly',
  PRO_YEARLY: 'flashdiet_pro_yearly',
  PREMIUM_MONTHLY: 'flashdiet_premium_monthly',
  PREMIUM_YEARLY: 'flashdiet_premium_yearly',
};

export const PRODUCT_DETAILS = [
  { id: PRODUCTS.PRO_MONTHLY, tier: 'pro' as SubscriptionTier, title: 'Pro Monthly', price: '$14.99', period: '/month', description: 'Unlimited scans, barcode scanner, hydration tracker & more', popular: false },
  { id: PRODUCTS.PRO_YEARLY, tier: 'pro' as SubscriptionTier, title: 'Pro Annual', price: '$8.99', period: '/month', priceAnnual: '$107.88/year', description: 'Save 40% — everything in Pro, billed yearly', popular: true, savings: 'Save 40%' },
  { id: PRODUCTS.PREMIUM_MONTHLY, tier: 'premium' as SubscriptionTier, title: 'Premium Monthly', price: '$29.99', period: '/month', description: 'AI Coach, custom meal plans, family mode & progress photos', popular: false },
  { id: PRODUCTS.PREMIUM_YEARLY, tier: 'premium' as SubscriptionTier, title: 'Premium Annual', price: '$19.99', period: '/month', priceAnnual: '$239.88/year', description: 'Save 33% — everything in Premium, billed yearly', popular: false, savings: 'Save 33%' },
];

class PurchaseService {
  private Purchases: any = null;
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      const RC = require('react-native-purchases');
      this.Purchases = RC.default ?? RC;
      const apiKey = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;
      await this.Purchases.configure({ apiKey });
      this.initialized = true;
      console.log('RevenueCat initialized ✅');
    } catch (err) {
      console.warn('RevenueCat not available, running in mock mode:', err);
      this.initialized = false;
    }
  }

  async getOfferings(): Promise<typeof PRODUCT_DETAILS> {
    if (!this.initialized || !this.Purchases) return PRODUCT_DETAILS;
    try {
      const offerings = await this.Purchases.getOfferings();
      if (offerings.current?.availablePackages?.length) {
        return offerings.current.availablePackages.map((pkg: any) => ({
          id: pkg.product.identifier,
          tier: pkg.product.identifier.includes('premium') ? 'premium' : 'pro',
          title: pkg.product.title,
          price: pkg.product.priceString,
          period: pkg.packageType === 'ANNUAL' ? '/year' : '/month',
          description: pkg.product.description,
          popular: pkg.packageType === 'ANNUAL',
        }));
      }
    } catch (err) {
      console.warn('getOfferings error:', err);
    }
    return PRODUCT_DETAILS;
  }

  async purchaseProduct(productId: string): Promise<Subscription | null> {
    if (!this.initialized || !this.Purchases) {
      // Mock for dev/testing
      const product = PRODUCT_DETAILS.find((p) => p.id === productId);
      if (!product) return null;
      const expiresAt = new Date();
      productId.includes('yearly') ? expiresAt.setFullYear(expiresAt.getFullYear() + 1) : expiresAt.setMonth(expiresAt.getMonth() + 1);
      return { tier: product.tier, expiresAt: expiresAt.getTime(), purchasedAt: Date.now(), productId };
    }

    try {
      const offerings = await this.Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages?.find(
        (p: any) => p.product.identifier === productId
      );
      if (!pkg) throw new Error('Package not found');
      const { customerInfo } = await this.Purchases.purchasePackage(pkg);
      return this._parseCustomerInfo(customerInfo, productId);
    } catch (err: any) {
      if (err?.userCancelled) return null;
      console.error('purchaseProduct error:', err);
      throw err;
    }
  }

  async restorePurchases(): Promise<Subscription | null> {
    if (!this.initialized || !this.Purchases) return null;
    try {
      const customerInfo = await this.Purchases.restorePurchases();
      return this._parseCustomerInfo(customerInfo);
    } catch (err) {
      console.error('restorePurchases error:', err);
      return null;
    }
  }

  async getActiveSubscription(): Promise<Subscription | null> {
    if (!this.initialized || !this.Purchases) return null;
    try {
      const customerInfo = await this.Purchases.getCustomerInfo();
      return this._parseCustomerInfo(customerInfo);
    } catch (err) {
      console.error('getActiveSubscription error:', err);
      return null;
    }
  }

  private _parseCustomerInfo(customerInfo: any, productId?: string): Subscription | null {
    const entitlements = customerInfo?.entitlements?.active ?? {};
    if (entitlements['premium']) {
      return { tier: 'premium', expiresAt: new Date(entitlements['premium'].expirationDate).getTime(), purchasedAt: Date.now(), productId: productId ?? PRODUCTS.PREMIUM_MONTHLY };
    }
    if (entitlements['pro']) {
      return { tier: 'pro', expiresAt: new Date(entitlements['pro'].expirationDate).getTime(), purchasedAt: Date.now(), productId: productId ?? PRODUCTS.PRO_MONTHLY };
    }
    return null;
  }

  isSubscriptionActive(subscription: Subscription): boolean {
    if (subscription.tier === 'free') return true;
    if (!subscription.expiresAt) return false;
    return subscription.expiresAt > Date.now();
  }

  canAccessFeature(feature: 'unlimited_scans' | 'barcode' | 'ai_coach' | 'meal_plans' | 'family', tier: SubscriptionTier): boolean {
    if (tier === 'premium') return true;
    if (tier === 'pro') return ['unlimited_scans', 'barcode'].includes(feature);
    return false;
  }
}

export const purchaseService = new PurchaseService();
