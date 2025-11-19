import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SIZES } from '../utils/theme';
import { useHabitStore } from '../store/habitStore';
import { useThemeStore } from '../store/themeStore';
import { ACHIEVEMENT_MILESTONES } from '../utils/constants';

const ACHIEVEMENT_IMAGES = {
  locked: 'https://images.unsplash.com/photo-1614851099175-e5b30eb6f696?w=400',
  unlocked: 'https://images.unsplash.com/photo-1533551100771-5ce1ab5e9063?w=400',
};

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: number;
  current: number;
}

export const AchievementsScreen = () => {
  const { habits } = useHabitStore();
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    calculateAchievements();
  }, [habits]);

  const calculateDaysClean = (quitDate: string) => {
    const now = new Date();
    const quit = new Date(quitDate);
    const diffTime = Math.abs(now.getTime() - quit.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateAchievements = () => {
    const totalDays = habits.reduce(
      (sum, habit) => sum + calculateDaysClean(habit.quitDate),
      0
    );

    const achievementList: Achievement[] = [
      ...ACHIEVEMENT_MILESTONES.map((milestone) => ({
        id: `days-${milestone.days}`,
        title: milestone.title,
        description: `Reach ${milestone.days} total days clean`,
        icon: milestone.icon,
        unlocked: totalDays >= milestone.days,
        unlockedAt: totalDays >= milestone.days ? new Date().toISOString() : undefined,
        requirement: milestone.days,
        current: totalDays,
      })),
      {
        id: 'multi-habit',
        title: 'Multi-Tasker',
        description: 'Track 3 or more habits',
        icon: '🎯',
        unlocked: habits.length >= 3,
        unlockedAt: habits.length >= 3 ? new Date().toISOString() : undefined,
        requirement: 3,
        current: habits.length,
      },
    ];

    setAchievements(achievementList);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progress = achievements.length > 0
    ? Math.round((unlockedCount / achievements.length) * 100)
    : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Achievements</Text>
          <Text style={[styles.headerSubtitle, { color: subText }]}>
            {unlockedCount} of {achievements.length} unlocked
          </Text>
        </View>

        {/* Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.progressLabel, { color: textColor }]}>Progress</Text>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#222' : '#E0E0E0' }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: isDark ? '#FFF' : '#000',
                  width: progressWidth,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: subText }]}>{progress}% complete</Text>
        </View>

        {/* Unlocked */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Unlocked</Text>
        {achievements.filter((a) => a.unlocked).length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: cardBg }]}>
            <Text style={styles.emptyIcon}>🕹️</Text>
            <Text style={[styles.emptyText, { color: textColor }]}>No achievements yet</Text>
            <Text style={[styles.emptySubtext, { color: subText }]}>
              Keep going! Unlock your first badge soon.
            </Text>
          </View>
        ) : (
          achievements
            .filter((a) => a.unlocked)
            .map((a, i) => (
              <View key={i} style={[styles.achievementCard, { backgroundColor: cardBg }]}>
                <View style={styles.iconBox}>
                  <Text style={styles.icon}>{a.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: textColor }]}>{a.title}</Text>
                  <Text style={[styles.description, { color: subText }]}>{a.description}</Text>
                  {a.unlockedAt && (
                    <Text style={[styles.date, { color: subText }]}>
                      Unlocked {new Date(a.unlockedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            ))
        )}

        {/* Locked */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Locked</Text>
        {achievements
          .filter((a) => !a.unlocked)
          .map((a, i) => (
            <View key={i} style={[styles.achievementCard, { backgroundColor: cardBg }]}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#222' : '#EEE' }]}>
                <Text style={[styles.icon, { opacity: 0.4 }]}>🔒</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: textColor }]}>{a.title}</Text>
                <Text style={[styles.description, { color: subText }]}>{a.description}</Text>
                <View style={styles.progressMini}>
                  <View
                    style={[
                      styles.progressMiniBar,
                      { backgroundColor: isDark ? '#222' : '#DDD' },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressMiniFill,
                        {
                          backgroundColor: isDark ? '#FFF' : '#000',
                          width: `${Math.min((a.current / a.requirement) * 100, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressMiniText, { color: subText }]}>
                    {a.current}/{a.requirement}
                  </Text>
                </View>
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100, paddingHorizontal: 16 },
  header: { alignItems: 'center', marginVertical: 30 },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  progressCard: { borderRadius: 16, padding: 16, marginBottom: 30 },
  progressLabel: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, marginTop: 10 },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  icon: { fontSize: 26 },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 13, marginTop: 2 },
  date: { fontSize: 11, marginTop: 4 },
  emptyState: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 50,
    marginBottom: 30,
  },
  emptyIcon: { fontSize: 60, marginBottom: 10 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptySubtext: { fontSize: 13, textAlign: 'center', maxWidth: 200 },
  progressMini: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressMiniBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressMiniFill: { height: '100%', borderRadius: 2 },
  progressMiniText: { fontSize: 11 },
});
