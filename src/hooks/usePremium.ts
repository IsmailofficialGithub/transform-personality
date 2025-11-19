import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PremiumStatus {
  isPremium: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number | null;
  subscriptionPlan: string | null;
  expirationDate: string | null;
  loading: boolean;
}

export const usePremium = () => {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    isTrialActive: false,
    trialDaysLeft: null,
    subscriptionPlan: null,
    expirationDate: null,
    loading: true,
  });

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      // PREMIUM LOGIC COMMENTED OUT - All features are now free
      // Check local premium status (for testing)
      // const premiumStatusLocal = await AsyncStorage.getItem('premium_status');
      // const trialStart = await AsyncStorage.getItem('trial_start_date');
      // const subscriptionPlan = await AsyncStorage.getItem('subscription_plan');

      // let isPremium = false;
      // let isTrialActive = false;
      // let trialDaysLeft = null;

      // // Check if trial is active
      // if (trialStart) {
      //   const startDate = new Date(trialStart);
      //   const now = new Date();
      //   const diffTime = now.getTime() - startDate.getTime();
      //   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      //   const daysLeft = 3 - diffDays;

      //   if (daysLeft > 0) {
      //     isTrialActive = true;
      //     trialDaysLeft = daysLeft;
      //     isPremium = true;
      //   }
      // }

      // // Check if has active subscription
      // if (premiumStatusLocal === 'true') {
      //   isPremium = true;
      // }

      // Always return premium as true (all features free)
      setPremiumStatus({
        isPremium: true, // Always true - all features are free
        isTrialActive: false,
        trialDaysLeft: null,
        subscriptionPlan: null,
        expirationDate: null,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking premium status:', error);
      setPremiumStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const activateTrial = async () => {
    try {
      await AsyncStorage.setItem('premium_status', 'true');
      await AsyncStorage.setItem('trial_start_date', new Date().toISOString());
      await checkPremiumStatus();
      return true;
    } catch (error) {
      console.error('Error activating trial:', error);
      return false;
    }
  };

  const activatePremium = async (planId: string) => {
    try {
      await AsyncStorage.setItem('premium_status', 'true');
      await AsyncStorage.setItem('subscription_plan', planId);
      await checkPremiumStatus();
      return true;
    } catch (error) {
      console.error('Error activating premium:', error);
      return false;
    }
  };

  const cancelPremium = async () => {
    try {
      await AsyncStorage.removeItem('premium_status');
      await AsyncStorage.removeItem('trial_start_date');
      await AsyncStorage.removeItem('subscription_plan');
      await checkPremiumStatus();
      return true;
    } catch (error) {
      console.error('Error canceling premium:', error);
      return false;
    }
  };

  const refreshStatus = async () => {
    await checkPremiumStatus();
  };

  return {
    ...premiumStatus,
    activateTrial,
    activatePremium,
    cancelPremium,
    refreshStatus,
  };
};