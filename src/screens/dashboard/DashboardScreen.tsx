import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-root-toast';
import { Bell } from 'lucide-react-native';
import { SIZES } from '../../utils/theme';
import {
  HABIT_IMAGES,
  HABIT_NAMES,
  MOTIVATIONAL_QUOTES,
} from '../../utils/constants';
import { useHabitStore } from '../../store/habitStore';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import HabitSelectionModal from '../onboarding/HabitSelectionModal';
import type { Screen } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

interface DashboardProps {
  onAddHabit?: () => void;
  onNavigate?: (screen: string) => void;
}

export const DashboardScreen = ({ onAddHabit, onNavigate }: DashboardProps) => {
  const { habits, loadHabits, deleteHabit } = useHabitStore();
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const [quote, setQuote] = useState<string | null>(null);
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [notification_count, setNotification_count] = useState(4);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  const currentUser = useAuthStore.getState().user;

  useEffect(() => {
    loadHabits?.();
    const randomQuote = MOTIVATIONAL_QUOTES[
      Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
    ];
    setQuote(randomQuote);

    // Animate on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onAddHabitPress = () => {
    setHabitModalVisible(true);
  };

  const handleProgressHubPress = () => {
    if (onNavigate) {
      onNavigate('progressHub');
    }
  };

  const handleQuickAction = (screen: string) => {
    if (onNavigate) {
      onNavigate(screen as Screen);
    }
  };

  const calculateDaysClean = (quitDate?: string) => {
    if (!quitDate) return 0;
    const now = new Date();
    const quit = new Date(quitDate);
    const diffTime = now.getTime() - quit.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const totalDaysClean = Array.isArray(habits)
    ? habits.reduce(
      (sum, habit) => sum + calculateDaysClean(habit.quitDate),
      0
    )
    : 0;

  const activeStreaks = Array.isArray(habits)
    ? habits.filter((h) => h.currentStreak && h.currentStreak > 0).length
    : 0;

  const longestStreak = Array.isArray(habits) && habits.length > 0
    ? Math.max(...habits.map(h => h.longestStreak || 0))
    : 0;

  const textColor = isDark ? '#FFF' : '#1A1A1A';
  const subText = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(30,30,30,0.95)' : '#FFFFFF';
  const accent = isDark ? '#FFF' : '#000';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { emoji: '🌅', text: 'Good Morning' };
    if (hour < 18) return { emoji: '☀️', text: 'Good Afternoon' };
    return { emoji: '🌙', text: 'Good Evening' };
  };

  const greeting = getGreeting();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#F5F7FA' },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Modern Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={[styles.greeting, { color: subText }]}>
                  {greeting.emoji} {greeting.text}
                </Text>
                <Text style={[styles.headerTitle, { color: textColor }]}>
                  {currentUser?.email?.split('@')[0] || 'Warrior'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: subText }]}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onNavigate?.('notificationSettings' as Screen)}
                  style={[
                    styles.notificationButton,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                  ]}
                >
                  <Bell
                    size={24}
                    color={isDark ? '#FFF' : '#000'}
                    strokeWidth={2}
                  />
                  <View style={[styles.notificationBadge, { backgroundColor: '#FF3B30' }]}>
                    <Text style={styles.notificationBadgeText}>{notification_count}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Stats Cards */}
        <View style={styles.statsContainer}>
          <Animated.View
            style={[
              styles.statCardWrapper,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statValue}>{habits?.length ?? 0}</Text>
              <Text style={styles.statLabel}>Active Habits</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[
              styles.statCardWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={['#F093FB', '#F5576C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{totalDaysClean}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[
              styles.statCardWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={['#4FACFE', '#00F2FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: cardBg, borderColor }]}
              onPress={() => handleQuickAction('logUrge')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FF3B30' + '20' }]}>
                <Text style={styles.quickActionEmoji}>🚨</Text>
              </View>
              <Text style={[styles.quickActionText, { color: textColor }]}>Log Urge</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: cardBg, borderColor }]}
              onPress={() => handleQuickAction('games')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#5AC8FA' + '20' }]}>
                <Text style={styles.quickActionEmoji}>🎮</Text>
              </View>
              <Text style={[styles.quickActionText, { color: textColor }]}>Games</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: cardBg, borderColor }]}
              onPress={() => handleQuickAction('communityFeed')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#34C759' + '20' }]}>
                <Text style={styles.quickActionEmoji}>👥</Text>
              </View>
              <Text style={[styles.quickActionText, { color: textColor }]}>Community</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: cardBg, borderColor }]}
              onPress={handleProgressHubPress}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#AF52DE' + '20' }]}>
                <Text style={styles.quickActionEmoji}>📈</Text>
              </View>
              <Text style={[styles.quickActionText, { color: textColor }]}>Progress</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Quote Card */}
        {quote && (
          <View style={[styles.quoteCard, { backgroundColor: cardBg, borderColor }]}>
            <LinearGradient
              colors={isDark
                ? ['rgba(102, 126, 234, 0.15)', 'rgba(118, 75, 162, 0.15)']
                : ['rgba(102, 126, 234, 0.08)', 'rgba(118, 75, 162, 0.08)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quoteGradient}
            >
              <Text style={styles.quoteIcon}>💬</Text>
              <Text style={[styles.quoteText, { color: textColor }]}>
                "{quote}"
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Enhanced Habits Section */}
        <View style={styles.habitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Your Habits
            </Text>
            <TouchableOpacity
              onPress={onAddHabitPress}
              style={styles.addHabitButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addHabitGradient}
              >
                <Text style={styles.addHabitText}>+ Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {!habits || habits.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>🎯</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                No habits tracked yet
              </Text>
              <Text style={[styles.emptySubtext, { color: subText }]}>
                Start your journey by adding your first habit
              </Text>
              <TouchableOpacity
                onPress={onAddHabitPress}
                style={styles.emptyButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.emptyButtonGradient}
                >
                  <Text style={styles.emptyButtonText}>Add Your First Habit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            habits.map((habit, index) => {
              const daysClean = calculateDaysClean(habit.quitDate);

              // Gradient colors based on habit type
              const getGradientColors = () => {
                const gradients: Record<string, string[]> = {
                  pornography: ['#FC5C7D', '#6A82FB'],
                  smoking: ['#F7971E', '#FFD200'],
                  alcohol: ['#FF416C', '#FF4B2B'],
                  gaming: ['#11998E', '#38EF7D'],
                  social_media: ['#4568DC', '#B06AB3'],
                  junk_food: ['#FDC830', '#F37335'],
                  gambling: ['#7F00FF', '#E100FF'],
                  shopping: ['#43C6AC', '#F8FFAE'],
                  custom: ['#667EEA', '#764BA2'],
                };
                return gradients[habit.type] || ['#667EEA', '#764BA2'];
              };

              const gradientColors = getGradientColors();

              return (
                <Animated.View
                  key={habit.id}
                  style={[
                    styles.habitCardWrapper,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    }
                  ]}
                >
                  <LinearGradient
                    colors={gradientColors as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.habitCard}
                  >
                    <View style={styles.habitCardContent}>
                      {/* Header */}
                      <View style={styles.habitCardHeader}>
                        <View style={styles.habitIconContainer}>
                          <Text style={styles.habitIcon}>
                            {(() => {
                              const icons: Record<string, string> = {
                                pornography: '🚫',
                                smoking: '🚭',
                                alcohol: '🍷',
                                gaming: '🎮',
                                social_media: '📱',
                                junk_food: '🍔',
                                gambling: '🎰',
                                shopping: '🛍️',
                                procrastination: '⏰',
                              };
                              return icons[habit.type] || '🎯';
                            })()}
                          </Text>
                        </View>
                        <View style={styles.habitHeaderText}>
                          <Text style={styles.habitCardName}>
                            {habit.customName || HABIT_NAMES[habit.type] || 'Habit'}
                          </Text>
                          <Text style={styles.habitCardDate}>
                            Since {habit.quitDate
                              ? new Date(habit.quitDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                              : 'Unknown'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Remove Habit',
                              'Are you sure you want to remove this habit?',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Remove',
                                  style: 'destructive',
                                  onPress: () => {
                                    try {
                                      deleteHabit(habit.id);
                                      Toast.show('Habit removed successfully', {
                                        duration: Toast.durations.SHORT,
                                        position: Toast.positions.TOP,
                                        backgroundColor: '#34C759',
                                        textColor: '#FFF',
                                      });
                                    } catch (error: any) {
                                      Toast.show('Failed to remove habit. Please try again.', {
                                        duration: Toast.durations.SHORT,
                                        position: Toast.positions.TOP,
                                        backgroundColor: '#FF3B30',
                                        textColor: '#FFF',
                                      });
                                    }
                                  },
                                },
                              ]
                            );
                          }}
                          style={styles.habitDeleteButton}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.habitDeleteIcon}>✕</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Stats */}
                      <View style={styles.habitStatsContainer}>
                        <View style={styles.habitStatDivider} />
                        <View style={styles.habitStatRow}>
                          <View style={styles.habitStatBox}>
                            <Text style={styles.habitStatValue}>{daysClean}</Text>
                            <Text style={styles.habitStatLabel}>Days Clean</Text>
                          </View>
                          <View style={styles.habitStatDivider} />
                          <View style={styles.habitStatBox}>
                            <Text style={styles.habitStatValue}>{habit.currentStreak ?? 0}</Text>
                            <Text style={styles.habitStatLabel}>Current</Text>
                          </View>
                          <View style={styles.habitStatDivider} />
                          <View style={styles.habitStatBox}>
                            <Text style={styles.habitStatValue}>{habit.longestStreak ?? 0}</Text>
                            <Text style={styles.habitStatLabel}>Best</Text>
                          </View>
                        </View>
                        <View style={styles.habitStatDivider} />
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>
              );
            })
          )}
        </View>

        <HabitSelectionModal
          visible={habitModalVisible}
          onClose={() => setHabitModalVisible(false)}
        />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerSection: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  notificationButton: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
    gap: 12,
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - SIZES.padding * 2 - 12) / 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionEmoji: {
    fontSize: 28,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  quoteCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  quoteGradient: {
    padding: 24,
    position: 'relative',
  },
  quoteIcon: {
    fontSize: 40,
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.2,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
    fontWeight: '500',
  },
  quoteAuthor: {
    fontSize: 14,
    textAlign: 'right',
    fontWeight: '600',
  },
  habitsSection: {
    paddingHorizontal: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addHabitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addHabitGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addHabitText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  habitCardWrapper: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  habitCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  habitCardContent: {
    padding: 20,
  },
  habitCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  habitIcon: {
    fontSize: 28,
  },
  habitHeaderText: {
    flex: 1,
  },
  habitCardName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  habitCardDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  habitDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitDeleteIcon: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  habitStatsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 4,
  },
  habitStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  habitStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  habitStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  habitStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  habitStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 60,
    paddingHorizontal: 32,
    borderWidth: 1,
    marginTop: 8,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
