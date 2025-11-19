import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { usePremium } from '../../hooks/usePremium';
import { SIZES } from '../../utils/theme';
import PaymentService from '../../services/PaymentService';

export const SubscriptionManagement = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const { isPremium, isTrialActive, trialDaysLeft } = usePremium();
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await PaymentService.checkSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'To cancel your subscription, please visit the App Store or Play Store settings. Your subscription will remain active until the end of the current billing period.',
      [{ text: 'OK' }]
    );
  };

  const handleRestorePurchases = async () => {
    try {
      const restored = await PaymentService.restorePurchases();
      if (restored) {
        Alert.alert('Success', 'Purchases restored successfully');
        loadSubscriptionStatus();
      } else {
        Alert.alert('No Purchases', 'No previous purchases found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Subscription</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Manage your premium subscription
          </Text>
        </View>

        {/* Current Status */}
        <View style={[styles.statusCard, { backgroundColor: cardBg }]}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusIcon}>{isPremium ? '💎' : '📱'}</Text>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: textColor }]}>
                {isPremium ? 'Premium Active' : 'Free Plan'}
              </Text>
              {isTrialActive && (
                <Text style={[styles.trialText, { color: colors.primary }]}>
                  {trialDaysLeft} days left in trial
                </Text>
              )}
              {subscriptionStatus?.expirationDate && (
                <Text style={[styles.expiryText, { color: subText }]}>
                  Expires: {new Date(subscriptionStatus.expirationDate).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg }]}
            onPress={handleRestorePurchases}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: textColor }]}>
                Restore Purchases
              </Text>
              <Text style={[styles.actionDesc, { color: subText }]}>
                Restore previous purchases on this device
              </Text>
            </View>
            <Text style={[styles.actionArrow, { color: subText }]}>›</Text>
          </TouchableOpacity>

          {isPremium && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: cardBg }]}
              onPress={handleCancelSubscription}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>❌</Text>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: textColor }]}>
                  Cancel Subscription
                </Text>
                <Text style={[styles.actionDesc, { color: subText }]}>
                  Cancel your subscription (active until period ends)
                </Text>
              </View>
              <Text style={[styles.actionArrow, { color: subText }]}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg }]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>💳</Text>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: textColor }]}>
                Update Payment Method
              </Text>
              <Text style={[styles.actionDesc, { color: subText }]}>
                Manage your payment information
              </Text>
            </View>
            <Text style={[styles.actionArrow, { color: subText }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.infoTitle, { color: textColor }]}>
            Subscription Information
          </Text>
          <Text style={[styles.infoText, { color: subText }]}>
            • Subscriptions are managed through the App Store or Play Store{'\n'}
            • You can cancel anytime from your device settings{'\n'}
            • Your subscription will remain active until the end of the billing period{'\n'}
            • No refunds for partial subscription periods
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  statusCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  trialText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  expiryText: {
    fontSize: 12,
  },
  actionsSection: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
  },
  actionArrow: {
    fontSize: 24,
    marginLeft: 8,
  },
  infoCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

