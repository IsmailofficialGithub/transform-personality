import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';
import PaymentService from '../../services/PaymentService';

const { width } = Dimensions.get('window');

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  savings?: string;
  description: string;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'trial_3day',
    name: '3-Day Free Trial',
    price: 0,
    duration: '3 days',
    description: 'Start your transformation journey risk-free',
    features: [
      'Full access to all premium games',
      'AI-powered progress analysis',
      'Advanced tracking & analytics',
      'Personalized recovery plans',
      'Priority support',
    ],
  },
  {
    id: 'sprint_7day',
    name: '7-Day Sprint',
    price: 10,
    duration: '7 days',
    description: 'Quick start to breaking bad habits',
    features: [
      'Everything in Free Trial',
      'Intensive 7-day program',
      'Daily coaching messages',
      'Urge prediction AI',
      'Progress milestones',
    ],
  },
  {
    id: 'challenge_21day',
    name: '21-Day Challenge',
    price: 20,
    duration: '21 days',
    popular: true,
    savings: 'Save $15',
    description: 'Our proven method: 50-80% habit reduction',
    features: [
      'Everything in 7-Day Sprint',
      'Scientifically-proven 21-day program',
      'Neural pathway rewiring',
      'Habit reduction guarantee',
      'Weekly accountability reports',
      'Exclusive community access',
    ],
  },
  {
    id: 'monthly_pro',
    name: 'Monthly Pro',
    price: 25,
    duration: 'per month',
    savings: 'Best Value',
    description: 'Ongoing support for lasting change',
    features: [
      'Everything in 21-Day Challenge',
      'Unlimited premium access',
      'Advanced AI coaching',
      'Custom recovery strategies',
      'VIP community status',
      'Future feature updates',
    ],
  },
];

interface PremiumScreenProps {
  onBack?: () => void;
}

export const PremiumScreen = ({ onBack }: PremiumScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [selectedPlan, setSelectedPlan] = useState<string>('challenge_21day');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    checkPremiumStatus();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      // Check if user has premium (for testing, check AsyncStorage)
      const premiumStatus = await AsyncStorage.getItem('premium_status');
      const trialStart = await AsyncStorage.getItem('trial_start_date');
      
      if (premiumStatus === 'true') {
        setIsPremium(true);
      }

      if (trialStart) {
        const startDate = new Date(trialStart);
        const now = new Date();
        const diffTime = now.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const daysLeft = 3 - diffDays;
        
        if (daysLeft > 0) {
          setTrialDaysLeft(daysLeft);
          setIsPremium(true);
        }
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const handlePurchase = async () => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;

    setIsPurchasing(true);

    try {
      // For testing: Just unlock premium
      if (plan.id === 'trial_3day') {
        await AsyncStorage.setItem('premium_status', 'true');
        await AsyncStorage.setItem('trial_start_date', new Date().toISOString());
        
        Alert.alert(
          '🎉 Free Trial Started!',
          'You now have 3 days of full premium access. Start your transformation journey today!',
          [{ text: 'Let\'s Go!', onPress: onBack }]
        );
      } else {
        // Simulate payment for testing
        Alert.alert(
          '💳 Test Payment',
          `In production, this would charge $${plan.price} for ${plan.duration}.\n\nFor testing, premium is now unlocked!`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Unlock (Test)',
              onPress: async () => {
                await AsyncStorage.setItem('premium_status', 'true');
                await AsyncStorage.setItem('subscription_plan', plan.id);
                
                Alert.alert(
                  '✅ Premium Unlocked!',
                  `You now have access to all premium features with the ${plan.name} plan!`,
                  [{ text: 'Start Now', onPress: onBack }]
                );
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      'Restore Purchases',
      'In production, this would restore your previous purchases from App Store/Google Play.',
      [{ text: 'OK' }]
    );
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={[styles.backText, { color: textColor }]}>← Back</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>✨</Text>
          <Text style={[styles.heroTitle, { color: textColor }]}>
            Unlock Your Full Potential
          </Text>
          <Text style={[styles.heroSubtitle, { color: subText }]}>
            Join thousands who've transformed their lives with our proven 21-day method
          </Text>

          {trialDaysLeft && trialDaysLeft > 0 && (
            <View style={styles.trialBadge}>
              <LinearGradient
                colors={['#00E676', '#00C853']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.trialGradient}
              >
                <Text style={styles.trialText}>
                  {trialDaysLeft} days left in your free trial
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: '#00E676' }]}>50-80%</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Habit Reduction</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: '#6C5CE7' }]}>21 Days</Text>
            <Text style={[styles.statLabel, { color: subText }]}>To Transform</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: '#FFD700' }]}>10,000+</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Success Stories</Text>
          </View>
        </View>

        {/* Plans */}
        <View style={styles.plansSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Choose Your Plan
          </Text>

          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                { backgroundColor: cardBg },
                selectedPlan === plan.id && styles.selectedPlan,
                plan.popular && styles.popularPlan,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.7}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.popularGradient}
                  >
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </LinearGradient>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, { color: textColor }]}>
                    {plan.name}
                  </Text>
                  <Text style={[styles.planDescription, { color: subText }]}>
                    {plan.description}
                  </Text>
                </View>
                <View style={styles.planPricing}>
                  {plan.price === 0 ? (
                    <Text style={[styles.planPrice, { color: '#00E676' }]}>FREE</Text>
                  ) : (
                    <>
                      <Text style={[styles.planPrice, { color: textColor }]}>
                        ${plan.price}
                      </Text>
                      <Text style={[styles.planDuration, { color: subText }]}>
                        {plan.duration}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {plan.savings && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{plan.savings}</Text>
                </View>
              )}

              <View style={styles.featuresSection}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={[styles.featureText, { color: textColor }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              {selectedPlan === plan.id && (
                <View style={styles.selectedIndicator}>
                  <LinearGradient
                    colors={['#6C5CE7', '#9C27B0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.selectedGradient}
                  >
                    <Text style={styles.selectedText}>✓ SELECTED</Text>
                  </LinearGradient>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Purchase Button */}
        <View style={styles.purchaseSection}>
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchase}
            disabled={isPurchasing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6C5CE7', '#9C27B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.purchaseGradient}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.purchaseText}>
                  {selectedPlan === 'trial_3day'
                    ? 'Start Free Trial'
                    : `Get ${PLANS.find(p => p.id === selectedPlan)?.name}`}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
          >
            <Text style={[styles.restoreText, { color: subText }]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </View>

        {/* Why Premium Section */}
        <View style={[styles.whySection, { backgroundColor: cardBg }]}>
          <Text style={[styles.whyTitle, { color: textColor }]}>
            🌟 Why Go Premium?
          </Text>
          
          <View style={styles.whyItem}>
            <Text style={styles.whyEmoji}>🎮</Text>
            <View style={styles.whyContent}>
              <Text style={[styles.whyItemTitle, { color: textColor }]}>
                Premium Games
              </Text>
              <Text style={[styles.whyItemText, { color: subText }]}>
                Access all 8 scientifically-designed games to combat urges
              </Text>
            </View>
          </View>

          <View style={styles.whyItem}>
            <Text style={styles.whyEmoji}>🤖</Text>
            <View style={styles.whyContent}>
              <Text style={[styles.whyItemTitle, { color: textColor }]}>
                AI Analysis
              </Text>
              <Text style={[styles.whyItemText, { color: subText }]}>
                Get personalized insights and predictions to prevent relapses
              </Text>
            </View>
          </View>

          <View style={styles.whyItem}>
            <Text style={styles.whyEmoji}>📊</Text>
            <View style={styles.whyContent}>
              <Text style={[styles.whyItemTitle, { color: textColor }]}>
                Advanced Tracking
              </Text>
              <Text style={[styles.whyItemText, { color: subText }]}>
                Deep analytics and progress visualization tools
              </Text>
            </View>
          </View>

          <View style={styles.whyItem}>
            <Text style={styles.whyEmoji}>💪</Text>
            <View style={styles.whyContent}>
              <Text style={[styles.whyItemTitle, { color: textColor }]}>
                21-Day Method
              </Text>
              <Text style={[styles.whyItemText, { color: subText }]}>
                Our proven program with 50-80% habit reduction guarantee
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={[styles.termsText, { color: subText }]}>
            • Free trial includes full access to all premium features{'\n'}
            • Cancel anytime before trial ends to avoid charges{'\n'}
            • Subscriptions auto-renew unless cancelled 24h before period ends{'\n'}
            • Payment charged to App Store/Google Play account
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 40,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 30,
  },
  heroEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  trialBadge: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  trialGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  trialText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 30,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  plansSection: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: '#6C5CE7',
  },
  popularPlan: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  popularGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  popularText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  planDuration: {
    fontSize: 11,
  },
  savingsBadge: {
    backgroundColor: '#00E676',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  savingsText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  featuresSection: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureCheck: {
    color: '#00E676',
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  selectedIndicator: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedGradient: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  purchaseSection: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 30,
  },
  purchaseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  purchaseGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  purchaseText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 14,
  },
  whySection: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  whyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  whyItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  whyEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  whyContent: {
    flex: 1,
  },
  whyItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  whyItemText: {
    fontSize: 13,
    lineHeight: 18,
  },
  termsSection: {
    paddingHorizontal: SIZES.padding,
  },
  termsText: {
    fontSize: 11,
    lineHeight: 18,
  },
});