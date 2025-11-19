import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVENUE_CAT_API_KEY = Platform.select({
  ios: 'YOUR_IOS_API_KEY',
  android: 'YOUR_ANDROID_API_KEY',
}) || '';

interface SubscriptionStatus {
  isPremium: boolean;
  expirationDate?: string;
  productId?: string;
}

class PaymentService {
  private initialized = false;

  async init(userId: string) {
    if (this.initialized) return;

    try {
      await Purchases.configure({ apiKey: REVENUE_CAT_API_KEY, appUserID: userId });
      this.initialized = true;
      console.log('RevenueCat initialized');
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error getting offerings:', error);
      return null;
    }
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      
      // Check if user now has premium access
      const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      
      if (isPremium) {
        await AsyncStorage.setItem('premium_status', 'true');
        console.log('✅ Premium unlocked!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error purchasing:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      
      if (isPremium) {
        await AsyncStorage.setItem('premium_status', 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }

  async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active['premium'];
      
      if (entitlement) {
        return {
          isPremium: true,
          expirationDate: entitlement.expirationDate || undefined,
          productId: entitlement.productIdentifier,
        };
      }
      
      return { isPremium: false };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { isPremium: false };
    }
  }

  async cancelSubscription(): Promise<boolean> {
    // Note: Actual cancellation happens through App Store/Play Store
    // This just updates local state
    try {
      await AsyncStorage.removeItem('premium_status');
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }
}

export default new PaymentService();