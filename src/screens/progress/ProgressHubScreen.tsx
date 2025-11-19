import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import { useHabitStore } from '../../store/habitStore';

const { width } = Dimensions.get('window');

interface ProgressHubScreenProps {
  onNavigate: (screen: string) => void;
}

export const ProgressHubScreen = ({ onNavigate }: ProgressHubScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const habits = useHabitStore((state) => state.habits);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
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

  const features = [
    {
      id: 'ai-analysis',
      title: 'AI Analysis',
      description: 'Get personalized insights powered by AI',
      icon: '🤖',
      gradient: ['#667EEA', '#764BA2'],
      screen: 'aiAnalysis',
    },
    {
      id: 'exercises',
      title: 'Exercises',
      description: 'Activities to overcome urges',
      icon: '💪',
      gradient: ['#00E676', '#00C853'],
      screen: 'exercises',
    },
    {
      id: 'selfies',
      title: 'Progress Photos',
      description: 'Track your visual transformation',
      icon: '📸',
      gradient: ['#FF9800', '#FF5722'],
      screen: 'selfies',
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Deep insights into your patterns',
      icon: '📊',
      gradient: ['#E91E63', '#9C27B0'],
      screen: 'advancedAnalytics',
    },
  ];

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
        <View style={styles.headerSection}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Progress Hub</Text>
          <Text style={[styles.headerSubtitle, { color: subText }]}>
            Advanced tracking & analysis tools
          </Text>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {habits.length}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>Active Habits</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {habits.reduce((sum, h) => sum + h.currentStreak, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>Total Days</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {Math.max(...habits.map(h => h.longestStreak), 0)}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>Best Streak</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {habits.reduce((sum, h) => sum + h.totalRelapses, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>Challenges</Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🎯 Progress Tools
          </Text>
          <Text style={[styles.sectionSubtitle, { color: subText }]}>
            Powerful features to track and improve your journey
          </Text>

          {features.map((feature, index) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: cardBg }]}
              onPress={() => onNavigate(feature.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.featureLeft}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={feature.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                  >
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.featureInfo}>
                  <Text style={[styles.featureTitle, { color: textColor }]}>
                    {feature.title}
                  </Text>
                  <Text style={[styles.featureDescription, { color: subText }]} numberOfLines={1}>
                    {feature.description}
                  </Text>
                </View>
              </View>
              <Text style={[styles.featureArrow, { color: subText }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            💡 Pro Tips
          </Text>

          <View style={[styles.tipsCard, { backgroundColor: cardBg }]}>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={[styles.tipText, { color: textColor }]}>
                Use AI Analysis daily for best insights
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={[styles.tipText, { color: textColor }]}>
                Try exercises when feeling triggered
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={[styles.tipText, { color: textColor }]}>
                Take weekly progress photos
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={[styles.tipText, { color: textColor }]}>
                Review analytics to track trends
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={[styles.tipText, { color: textColor }]}>
                Share progress for accountability
              </Text>
            </View>
          </View>
        </View>

        {/* Motivation Card */}
        <View style={[styles.motivationCard, { backgroundColor: cardBg }]}>
          <Text style={styles.motivationIcon}>🌟</Text>
          <Text style={[styles.motivationTitle, { color: textColor }]}>
            Keep Going!
          </Text>
          <Text style={[styles.motivationText, { color: subText }]}>
            Every day clean is a victory. Use these tools to track your progress and stay motivated.
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
    paddingBottom: 100,
  },
  headerSection: {
    paddingHorizontal: SIZES.padding,
    marginTop: 40,
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: SIZES.small,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    marginBottom: 25,
  },
  statCard: {
    width: (width - SIZES.padding * 2 - 12) / 2,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: SIZES.padding,
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginRight: 14,
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 28,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
  },
  featureArrow: {
    fontSize: 28,
    marginLeft: 8,
  },
  tipsCard: {
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipBullet: {
    fontSize: 18,
    color: '#6C5CE7',
    marginRight: 10,
    marginTop: -2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  motivationCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  motivationIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});