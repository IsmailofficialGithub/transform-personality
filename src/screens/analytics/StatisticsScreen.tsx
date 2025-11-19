import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabitStore } from '../../store/habitStore';
import { useThemeStore } from '../../store/themeStore';
import { HABIT_NAMES } from '../../utils/constants';
import { SIZES } from '../../utils/theme';

const { width } = Dimensions.get('window');

export const StatisticsScreen = () => {
  const { habits, urgeLogs } = useHabitStore();
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

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

  const calculateDaysClean = (quitDate: string) => {
    const now = new Date();
    const quit = new Date(quitDate);
    return Math.floor(Math.abs(now.getTime() - quit.getTime()) / (1000 * 60 * 60 * 24));
  };

  const totalDaysClean = habits.reduce(
    (sum, habit) => sum + calculateDaysClean(habit.quitDate),
    0
  );

  const totalUrgesLogged = urgeLogs.length;
  const urgesOvercome = urgeLogs.filter((log) => log.overcome).length;
  const successRate =
    totalUrgesLogged > 0
      ? Math.round((urgesOvercome / totalUrgesLogged) * 100)
      : 0;

  const averageIntensity =
    totalUrgesLogged > 0
      ? (urgeLogs.reduce((sum, log) => sum + log.intensity, 0) / totalUrgesLogged).toFixed(1)
      : '0';

  // Chart Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  }).reverse();

  const urgesByDay = last7Days.map(
    (day) => urgeLogs.filter((log) => new Date(log.timestamp).toDateString() === day).length
  );

  const maxUrges = Math.max(...urgesByDay, 1);

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
          <Text style={[styles.headerTitle, { color: textColor }]}>Your Stats</Text>
          <Text style={[styles.headerSubtitle, { color: subText }]}>
            Track your progress and performance over time
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>{totalDaysClean}</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Total Days Clean</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>{successRate}%</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Success Rate</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>{totalUrgesLogged}</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Urges Logged</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>{averageIntensity}</Text>
            <Text style={[styles.statLabel, { color: subText }]}>Avg Intensity</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={[styles.chartCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.chartTitle, { color: textColor }]}>
            📈 Weekly Urge Tracking
          </Text>
          <Text style={[styles.chartSubtitle, { color: subText }]}>
            Last 7 days overview
          </Text>

          <View style={styles.chart}>
            {urgesByDay.map((count, index) => {
              const height = (count / maxUrges) * 120;
              const dayName = new Date(last7Days[index]).toLocaleDateString('en-US', {
                weekday: 'short',
              });
              return (
                <View key={index} style={styles.barContainer}>
                  <Text style={[styles.barCount, { color: subText }]}>{count}</Text>
                  <View style={styles.barWrapper}>
                    <LinearGradient
                      colors={count === 0 ? ['#00E676', '#00C853'] : ['#667EEA', '#764BA2']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[styles.bar, { height: height || 6 }]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: subText }]}>{dayName}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Individual Habit Stats */}
        {habits.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              📋 Habit Performance
            </Text>
            {habits.map((habit, index) => {
              const habitUrges = urgeLogs.filter((log) => log.habitId === habit.id);
              const habitSuccessRate =
                habitUrges.length > 0
                  ? Math.round(
                      (habitUrges.filter((log) => log.overcome).length /
                        habitUrges.length) *
                        100
                    )
                  : 0;

              return (
                <View key={habit.id} style={[styles.habitCard, { backgroundColor: cardBg }]}>
                  <View style={styles.habitHeader}>
                    <Text style={[styles.habitName, { color: textColor }]}>
                      {habit.customName || HABIT_NAMES[habit.type]}
                    </Text>
                    <Text style={[styles.habitSub, { color: subText }]}>
                      Started {new Date(habit.quitDate).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.habitStats}>
                    <View style={styles.habitStatItem}>
                      <Text style={[styles.habitStatValue, { color: textColor }]}>
                        {calculateDaysClean(habit.quitDate)}
                      </Text>
                      <Text style={[styles.habitStatLabel, { color: subText }]}>Days</Text>
                    </View>
                    <View style={styles.habitStatItem}>
                      <Text style={[styles.habitStatValue, { color: textColor }]}>
                        {habitUrges.length}
                      </Text>
                      <Text style={[styles.habitStatLabel, { color: subText }]}>Urges</Text>
                    </View>
                    <View style={styles.habitStatItem}>
                      <Text style={[styles.habitStatValue, { color: textColor }]}>
                        {habitSuccessRate}%
                      </Text>
                      <Text style={[styles.habitStatLabel, { color: subText }]}>Success</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  headerSection: { paddingHorizontal: SIZES.padding, marginTop: 40, marginBottom: 25 },
  headerTitle: { fontSize: SIZES.h1, fontWeight: '700' },
  headerSubtitle: { fontSize: SIZES.small, marginTop: 4 },
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
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 6, textAlign: 'center' },
  chartCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 18,
    marginBottom: 25,
  },
  chartTitle: { fontSize: 17, fontWeight: '700' },
  chartSubtitle: { fontSize: 13, marginTop: 2 },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    marginTop: 20,
  },
  barContainer: { alignItems: 'center', flex: 1 },
  barWrapper: { height: 120, width: '40%', borderRadius: 6, overflow: 'hidden' },
  bar: { borderRadius: 6, width: '100%' },
  barCount: { fontSize: 12, marginBottom: 6 },
  barLabel: { fontSize: 11, marginTop: 6 },
  section: { paddingHorizontal: SIZES.padding, marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  habitCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  habitHeader: { marginBottom: 10 },
  habitName: { fontSize: 16, fontWeight: '700' },
  habitSub: { fontSize: 13, marginTop: 2 },
  habitStats: { flexDirection: 'row', justifyContent: 'space-between' },
  habitStatItem: { alignItems: 'center', flex: 1 },
  habitStatValue: { fontSize: 18, fontWeight: '700' },
  habitStatLabel: { fontSize: 12, marginTop: 2 },
});
