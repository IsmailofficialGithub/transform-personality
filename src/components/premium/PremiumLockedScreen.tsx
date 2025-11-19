import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';

interface PremiumLockedScreenProps {
  feature: string;
  description?: string;
  benefits?: string[];
  onUpgrade?: () => void;
  onBack?: () => void;
}

export const PremiumLockedScreen = ({
  feature,
  description = `${feature} is a premium feature designed to help you achieve lasting transformation.`,
  benefits = [
    'Unlock unlimited habits',
    'Access all premium games',
    'AI-powered insights',
    'Advanced analytics',
    'Priority support',
  ],
  onUpgrade,
  onBack,
}: PremiumLockedScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {onBack && (
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backText, { color: textColor }]}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lock Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Text style={styles.lockIcon}>🔒</Text>
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: textColor }]}>
          Premium Feature Locked
        </Text>

        {/* Feature Name */}
        <View style={[styles.featureCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.featureName, { color: textColor }]}>
            {feature}
          </Text>
          <Text style={[styles.description, { color: subText }]}>
            {description}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: '#00E676' }]}>50-80%</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Success Rate</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: '#6C5CE7' }]}>21 Days</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Transform</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: '#FFD700' }]}>$10</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Start From</Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={[styles.benefitsCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.benefitsTitle, { color: textColor }]}>
            ✨ Premium Includes
          </Text>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={[styles.benefitText, { color: textColor }]}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        {/* Upgrade Button */}
        {onUpgrade && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgrade}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6C5CE7', '#9C27B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeGradient}
            >
              <Text style={styles.upgradeText}>Unlock Premium Features</Text>
              <Text style={styles.upgradeSubtext}>3-day free trial • Cancel anytime</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: cardBg }]}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={[styles.infoText, { color: subText }]}>
            Join thousands who've transformed their lives with our proven 21-day method
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginTop: 40,
    marginBottom: 24,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  featureName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
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
  benefitsCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 20,
    color: '#00E676',
    marginRight: 12,
    fontWeight: '700',
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  upgradeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  upgradeText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  upgradeSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  infoBox: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});