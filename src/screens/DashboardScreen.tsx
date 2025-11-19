import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../utils/theme';
import {
  HABIT_IMAGES,
  HABIT_NAMES,
  MOTIVATIONAL_QUOTES,
} from '../utils/constants';
import { useHabitStore } from '../store/habitStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import HabitSelectionModal from './onboarding/HabitSelectionModal';

interface DashboardProps {
  onAddHabit?: () => void;
  onNavigate?: (screen: string) => void; // ADD THIS
}

export const DashboardScreen = ({ onAddHabit, onNavigate }: DashboardProps) => {
  const { habits, loadHabits, deleteHabit } = useHabitStore();
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [habitModalVisible, setHabitModalVisible] = useState(false);

  const currentUser = useAuthStore.getState().user;

  useEffect(() => {
    loadHabits?.();
    // Set random quote on mount
    const randomQuote = MOTIVATIONAL_QUOTES[
      Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
    ];
    setQuote(randomQuote);
  }, []);

  const onAddHabitPress = () => {
    setHabitModalVisible(true);
  };

  const handleProgressHubPress = () => {
    if (onNavigate) {
      onNavigate('progressHub');
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

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';
  const accent = isDark ? '#FFF' : '#000';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000' : '#F9F9F9' },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View>
            <Text style={[styles.greeting, { color: subText }]}>
              {new Date().getHours() < 12
                ? '🌅 Good Morning'
                : new Date().getHours() < 18
                ? '☀️ Good Afternoon'
                : '🌙 Good Evening'}
            </Text>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              {currentUser?.email ?? 'Your Journey'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: subText }]}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Add Habit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onAddHabitPress}
            style={styles.addButtonContainer}
          >
            <LinearGradient
              colors={isDark ? ['#6C5CE7', '#8E44AD'] : ['#A29BFE', '#6C5CE7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>＋</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: accent }]}>
              {habits?.length ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>
              Active Habits
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: accent }]}>
              {totalDaysClean}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>
              Total Days
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: accent }]}>
              {activeStreaks}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>
              Active Streaks
            </Text>
          </View>
        </View>

        {/* Motivational Quote - FIXED */}
        {quote && (
          <View style={[styles.quoteCard, { backgroundColor: cardBg }]}>
            <Text style={styles.quoteIcon}>💬</Text>
            <Text style={[styles.quoteText, { color: textColor }]}>
              "{quote.text}"
            </Text>
            <Text style={[styles.quoteAuthor, { color: subText }]}>
              — {quote.author}
            </Text>
          </View>
        )}

        {/* Quick Access - FIXED CLICKABLE */}
        <View style={styles.quickAccessSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🎯 Quick Access
          </Text>

          <TouchableOpacity
            style={[styles.quickAccessCard, { backgroundColor: cardBg }]}
            onPress={handleProgressHubPress}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickAccessGradient}
            >
              <Text style={styles.quickAccessIcon}>🎯</Text>
              <View style={styles.quickAccessInfo}>
                <Text style={styles.quickAccessTitle}>Progress Hub</Text>
                <Text style={styles.quickAccessSubtitle}>
                  AI Analysis • Exercises • Photos
                </Text>
              </View>
              <Text style={styles.quickAccessArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Habits */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Your Habits
          </Text>

          {!habits || habits.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBg }]}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={[styles.emptyText, { color: textColor }]}>
                No habits tracked yet!
              </Text>
              <Text style={[styles.emptySubtext, { color: subText }]}>
                Start by adding a habit to begin your journey.
              </Text>
            </View>
          ) : (
            habits.map((habit) => {
              const daysClean = calculateDaysClean(habit.quitDate);
              return (
                <View
                  key={habit.id}
                  style={[styles.habitCard, { backgroundColor: cardBg }]}
                >
                  {HABIT_IMAGES[habit.type] ? (
                    <Image
                      source={{ uri: HABIT_IMAGES[habit.type] }}
                      style={styles.habitImage}
                      resizeMode="cover"
                    />
                  ) : null}

                  <View style={styles.habitContent}>
                    <Text style={[styles.habitName, { color: textColor }]}>
                      {habit.customName || HABIT_NAMES[habit.type] || 'Habit'}
                    </Text>
                    <Text style={[styles.habitDate, { color: subText }]}>
                      Started{' '}
                      {habit.quitDate
                        ? new Date(habit.quitDate).toLocaleDateString()
                        : 'Unknown'}
                    </Text>

                    <View style={styles.habitStats}>
                      <View style={styles.habitStatItem}>
                        <Text
                          style={[styles.habitStatValue, { color: accent }]}
                        >
                          {daysClean}
                        </Text>
                        <Text
                          style={[styles.habitStatLabel, { color: subText }]}
                        >
                          Days Clean
                        </Text>
                      </View>

                      <View style={styles.habitStatItem}>
                        <Text
                          style={[styles.habitStatValue, { color: accent }]}
                        >
                          {habit.currentStreak ?? 0}
                        </Text>
                        <Text
                          style={[styles.habitStatLabel, { color: subText }]}
                        >
                          Current
                        </Text>
                      </View>

                      <View style={styles.habitStatItem}>
                        <Text
                          style={[styles.habitStatValue, { color: accent }]}
                        >
                          {habit.longestStreak ?? 0}
                        </Text>
                        <Text
                          style={[styles.habitStatLabel, { color: subText }]}
                        >
                          Best
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteHabit(habit.id)}
                    >
                      <Text
                        style={[styles.deleteButtonText, { color: '#FF5252' }]}
                      >
                        Remove Habit
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <HabitSelectionModal
          visible={habitModalVisible}
          onClose={() => setHabitModalVisible(false)}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  headerSection: {
    paddingHorizontal: SIZES.padding,
    marginTop: 40,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: SIZES.body, marginBottom: 4 },
  headerTitle: { fontSize: SIZES.h4, fontWeight: '700' },
  headerSubtitle: { fontSize: SIZES.small },
  addButtonContainer: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { 
    color: '#FFF', 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginTop: -2 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 25,
    paddingHorizontal: SIZES.padding,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 6, textAlign: 'center' },
  quoteCard: { 
    marginHorizontal: SIZES.padding, 
    borderRadius: 12, 
    padding: 18, 
    marginBottom: 25,
    position: 'relative',
  },
  quoteIcon: {
    fontSize: 32,
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.3,
  },
  quoteText: { 
    fontSize: 15, 
    fontStyle: 'italic', 
    lineHeight: 22,
    marginBottom: 8,
  },
  quoteAuthor: { 
    fontSize: 13, 
    textAlign: 'right', 
    marginTop: 6,
    fontWeight: '600',
  },
  quickAccessSection: { 
    paddingHorizontal: SIZES.padding, 
    marginBottom: 25 
  },
  quickAccessCard: { 
    borderRadius: 12, 
    overflow: 'hidden',
  },
  quickAccessGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  quickAccessIcon: { 
    fontSize: 28, 
    marginRight: 12 
  },
  quickAccessInfo: { flex: 1 },
  quickAccessTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#FFF' 
  },
  quickAccessSubtitle: { 
    fontSize: 13, 
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  quickAccessArrow: { 
    fontSize: 20, 
    color: '#FFF' 
  },
  section: { paddingHorizontal: SIZES.padding },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  habitCard: { borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  habitImage: { width: '100%', height: 160 },
  habitContent: { padding: 16 },
  habitName: { fontSize: 17, fontWeight: '700' },
  habitDate: { fontSize: 13, marginTop: 2, marginBottom: 10 },
  habitStats: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },
  habitStatItem: { alignItems: 'center', flex: 1 },
  habitStatValue: { fontSize: 18, fontWeight: '700' },
  habitStatLabel: { fontSize: 12, marginTop: 2 },
  deleteButton: {
    borderColor: '#FF5252',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteButtonText: { fontSize: 13, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 60,
    marginBottom: 30,
  },
  emptyIcon: { fontSize: 60, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptySubtext: { fontSize: 13, textAlign: 'center', maxWidth: 220 },
});