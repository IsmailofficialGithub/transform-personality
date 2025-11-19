import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { COLORS, SIZES, SHADOWS } from '@utils/theme';
import { Habit } from '@types/habit.types';
import { HABIT_ICONS, HABIT_NAMES } from '@utils/constants';

interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SIZES.padding * 2;

const gradientMap: Record<string, string[]> = {
  pornography: ['#FC5C7D', '#6A82FB'],
  smoking: ['#F7971E', '#FFD200'],
  alcohol: ['#FF416C', '#FF4B2B'],
  gaming: ['#11998E', '#38EF7D'],
  social_media: ['#4568DC', '#B06AB3'],
  junk_food: ['#FDC830', '#F37335'],
  gambling: ['#7F00FF', '#E100FF'],
  shopping: ['#43C6AC', '#F8FFAE'],
  procrastination: ['#FF6B6B', '#556270'],
  custom: COLORS.gradientPurple,
};

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  const daysSinceQuit = Math.floor(
    (new Date().getTime() - new Date(habit.quitDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const gradientColors = gradientMap[habit.type] || COLORS.gradientPurple;

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, SHADOWS.large]}
        >
          <View style={styles.header}>
            <Text style={styles.icon}>{HABIT_ICONS[habit.type]}</Text>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {habit.customName || HABIT_NAMES[habit.type]}
              </Text>
              <Text style={styles.subtitle}>
                Since {new Date(habit.quitDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{daysSinceQuit}</Text>
              <Text style={styles.statLabel}>Days Clean</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{habit.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{habit.longestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View
              style={[
                styles.badge,
                habit.severity === 'severe'
                  ? styles.badgeSevere
                  : habit.severity === 'moderate'
                  ? styles.badgeModerate
                  : styles.badgeMild,
              ]}
            >
              <Text style={styles.badgeText}>
                {habit.severity.toUpperCase()}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: SIZES.radiusLarge * 1.2,
    padding: SIZES.paddingLarge,
    marginBottom: SIZES.margin,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  icon: {
    fontSize: 52,
    marginRight: SIZES.marginSmall,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: '#FFF',
  },
  subtitle: {
    fontSize: SIZES.small,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SIZES.paddingSmall,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: SIZES.radiusLarge,
    marginBottom: SIZES.margin,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: '#FFF',
  },
  statLabel: {
    fontSize: SIZES.tiny,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: SIZES.tiny,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  badgeSevere: {
    backgroundColor: 'rgba(255, 0, 0, 0.4)',
  },
  badgeModerate: {
    backgroundColor: 'rgba(255, 165, 0, 0.4)',
  },
  badgeMild: {
    backgroundColor: 'rgba(0, 255, 127, 0.4)',
  },
});
