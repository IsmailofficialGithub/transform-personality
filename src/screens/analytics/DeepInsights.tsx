import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabitStore } from '../../store/habitStore';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';

const { width } = Dimensions.get('window');

interface DeepInsightsProps {
  onNavigate?: (screen: string) => void;
}

export const DeepInsights = ({ onNavigate }: DeepInsightsProps) => {
  const habits = useHabitStore((state) => state.habits);
  const urgeLogs = useHabitStore((state) => state.urgeLogs);
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  // Calculate peak urge times
  const peakTimes = useMemo(() => {
    const hourCounts: { [key: number]: number } = {};
    urgeLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    return hourCounts;
  }, [urgeLogs]);

  const peakHour = useMemo(() => {
    const entries = Object.entries(peakTimes);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => 
      peakTimes[parseInt(a[0])] > peakTimes[parseInt(b[0])] ? a : b
    )[0];
  }, [peakTimes]);

  // Calculate success rate
  const successRate = useMemo(() => {
    const totalUrges = urgeLogs.length;
    if (totalUrges === 0) return 0;
    const resistedUrges = urgeLogs.filter(log => log.resisted).length;
    return (resistedUrges / totalUrges) * 100;
  }, [urgeLogs]);

  // Calculate average urges per day
  const avgUrgesPerDay = useMemo(() => {
    if (urgeLogs.length === 0) return 0;
    const days = new Set(urgeLogs.map(log => 
      new Date(log.timestamp).toDateString()
    )).size;
    return (urgeLogs.length / Math.max(days, 1)).toFixed(1);
  }, [urgeLogs]);

  // Calculate longest streak
  const longestStreak = useMemo(() => {
    return Math.max(...habits.map(h => h.longestStreak), 0);
  }, [habits]);

  // Calculate trigger patterns
  const triggerPatterns = useMemo(() => {
    const triggers: { [key: string]: number } = {};
    urgeLogs.forEach(log => {
      if (log.trigger) {
        triggers[log.trigger] = (triggers[log.trigger] || 0) + 1;
      }
    });
    return Object.entries(triggers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [urgeLogs]);

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Deep Insights</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Advanced analytics and patterns
          </Text>
        </View>

        {/* Peak Urge Times */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⏰</Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Peak Urge Times
            </Text>
          </View>
          {peakHour ? (
            <>
              <Text style={[styles.cardValue, { color: colors.primary }]}>
                {peakHour}:00
              </Text>
              <Text style={[styles.cardDesc, { color: subText }]}>
                Most urges occur at this time
              </Text>
              <View style={styles.heatmap}>
                {Array.from({ length: 24 }, (_, i) => {
                  const count = peakTimes[i] || 0;
                  const maxCount = Math.max(...Object.values(peakTimes), 1);
                  const intensity = count / maxCount;
                  return (
                    <View key={i} style={styles.heatmapItem}>
                      <View
                        style={[
                          styles.heatmapBar,
                          {
                            height: `${intensity * 100}%`,
                            backgroundColor: intensity > 0.7 
                              ? colors.error 
                              : intensity > 0.4 
                              ? colors.warning 
                              : colors.primary,
                            opacity: intensity || 0.2,
                          },
                        ]}
                      />
                      <Text style={[styles.heatmapLabel, { color: subText }]}>
                        {i}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={[styles.cardDesc, { color: subText }]}>
              Not enough data yet
            </Text>
          )}
        </View>

        {/* Success Rate */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🎯</Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Success Rate
            </Text>
          </View>
          <Text style={[styles.cardValue, { color: colors.primary }]}>
            {successRate.toFixed(1)}%
          </Text>
          <Text style={[styles.cardDesc, { color: subText }]}>
            {urgeLogs.filter(log => log.resisted).length} out of {urgeLogs.length} urges resisted
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <LinearGradient
              colors={colors.gradientPurple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${successRate}%` }]}
            />
          </View>
        </View>

        {/* Average Urges Per Day */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Average Urges Per Day
            </Text>
          </View>
          <Text style={[styles.cardValue, { color: colors.primary }]}>
            {avgUrgesPerDay}
          </Text>
          <Text style={[styles.cardDesc, { color: subText }]}>
            Based on your tracking history
          </Text>
        </View>

        {/* Longest Streak */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🔥</Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Longest Streak
            </Text>
          </View>
          <Text style={[styles.cardValue, { color: colors.primary }]}>
            {longestStreak} days
          </Text>
          <Text style={[styles.cardDesc, { color: subText }]}>
            Your personal best record
          </Text>
        </View>

        {/* Top Triggers */}
        {triggerPatterns.length > 0 && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>⚡</Text>
              <Text style={[styles.cardTitle, { color: textColor }]}>
                Top Triggers
              </Text>
            </View>
            {triggerPatterns.map(([trigger, count], index) => (
              <View key={trigger} style={styles.triggerItem}>
                <View style={styles.triggerRank}>
                  <Text style={[styles.triggerRankText, { color: colors.primary }]}>
                    #{index + 1}
                  </Text>
                </View>
                <View style={styles.triggerInfo}>
                  <Text style={[styles.triggerName, { color: textColor }]}>
                    {trigger}
                  </Text>
                  <Text style={[styles.triggerCount, { color: subText }]}>
                    {count} times
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Predictions */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🔮</Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Predictions
            </Text>
          </View>
          <Text style={[styles.predictionText, { color: subText }]}>
            Based on your patterns, you're likely to experience fewer urges in the coming weeks as your streak continues to grow.
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
  card: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  heatmap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 16,
  },
  heatmapItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heatmapBar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  heatmapLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  triggerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  triggerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  triggerRankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  triggerInfo: {
    flex: 1,
  },
  triggerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  triggerCount: {
    fontSize: 12,
  },
  predictionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

