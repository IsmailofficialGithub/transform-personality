import React, { useEffect, useState } from 'react';
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
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import { useHabitStore } from '../../store/habitStore';
import { AnalyticsEngine, AnalyticsData } from '../../utils/analytics';

const { width } = Dimensions.get('window');

interface AdvancedAnalyticsScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export const AdvancedAnalyticsScreen = ({ onBack, onNavigate }: AdvancedAnalyticsScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const habits = useHabitStore((state) => state.habits);
  const urgeLogs = useHabitStore((state) => state.urgeLogs);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const data = AnalyticsEngine.calculateAnalytics(habits, urgeLogs);
    setAnalytics(data);
  }, [habits, urgeLogs]);

  if (!analytics) return null;

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  const getRiskColor = (score: number): string => {
    if (score < 30) return '#00E676';
    if (score < 60) return '#FF9800';
    return '#FF5252';
  };

  const getImprovementColor = (score: number): string => {
    if (score >= 70) return '#00E676';
    if (score >= 40) return '#FF9800';
    return '#FF5252';
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Improvement Score */}
        <View style={[styles.scoreCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.scoreLabel, { color: subText }]}>
            Improvement Score
          </Text>
          <View style={styles.scoreCircle}>
            <LinearGradient
              colors={[getImprovementColor(analytics.improvementScore), getImprovementColor(analytics.improvementScore) + '80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scoreGradient}
            >
              <Text style={styles.scoreValue}>
                {Math.round(analytics.improvementScore)}
              </Text>
              <Text style={styles.scoreSubtext}>/ 100</Text>
            </LinearGradient>
          </View>
          <View style={styles.trendBadge}>
            <Text style={styles.trendEmoji}>
              {analytics.improvementTrend === 'improving' ? '📈' : analytics.improvementTrend === 'declining' ? '📉' : '➡️'}
            </Text>
            <Text style={[styles.trendText, { color: textColor }]}>
              {analytics.improvementTrend === 'improving' ? 'Improving' : analytics.improvementTrend === 'declining' ? 'Declining' : 'Stable'}
            </Text>
          </View>
        </View>

        {/* Success Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.metricValue, { color: '#00E676' }]}>
              {analytics.overallSuccessRate.toFixed(0)}%
            </Text>
            <Text style={[styles.metricLabel, { color: subText }]}>
              Overall Success
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.metricValue, { color: '#FFD700' }]}>
              {analytics.currentSuccessStreak}
            </Text>
            <Text style={[styles.metricLabel, { color: subText }]}>
              Success Streak
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.metricValue, { color: getRiskColor(analytics.riskScore) }]}>
              {Math.round(analytics.riskScore)}
            </Text>
            <Text style={[styles.metricLabel, { color: subText }]}>
              Risk Score
            </Text>
          </View>
        </View>

        {/* Weekly Comparison */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            📊 Weekly Comparison
          </Text>
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonLabel, { color: subText }]}>
                Last Week
              </Text>
              <Text style={[styles.comparisonValue, { color: textColor }]}>
                {analytics.weeklyComparison.lastWeek}
              </Text>
            </View>
            <View style={styles.comparisonArrow}>
              <Text style={styles.arrowIcon}>
                {analytics.weeklyComparison.change < 0 ? '📉' : analytics.weeklyComparison.change > 0 ? '📈' : '➡️'}
              </Text>
            </View>
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonLabel, { color: subText }]}>
                This Week
              </Text>
              <Text style={[styles.comparisonValue, { color: textColor }]}>
                {analytics.weeklyComparison.thisWeek}
              </Text>
            </View>
          </View>
          <Text style={[styles.comparisonChange, { 
            color: analytics.weeklyComparison.change < 0 ? '#00E676' : '#FF9800' 
          }]}>
            {analytics.weeklyComparison.change > 0 ? '+' : ''}{analytics.weeklyComparison.change} urges (
            {analytics.weeklyComparison.percentChange > 0 ? '+' : ''}{analytics.weeklyComparison.percentChange.toFixed(0)}%)
          </Text>
        </View>

        {/* Insights */}
        {analytics.insights.length > 0 && (
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              💡 Insights
            </Text>
            {analytics.insights.map((insight) => (
              <View key={insight.id} style={styles.insightCard}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <View style={styles.insightContent}>
                  <Text style={[styles.insightTitle, { color: textColor }]}>
                    {insight.title}
                  </Text>
                  <Text style={[styles.insightMessage, { color: subText }]}>
                    {insight.message}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Peak Times */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🕐 Peak Urge Times
          </Text>
          {analytics.peakUrgeHours.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.peakTimeItem}>
              <View style={styles.peakTimeRank}>
                <Text style={styles.peakTimeRankText}>#{index + 1}</Text>
              </View>
              <Text style={[styles.peakTimeHour, { color: textColor }]}>
                {item.hour}:00 - {item.hour + 1}:00
              </Text>
              <View style={styles.peakTimeBar}>
                <View 
                  style={[
                    styles.peakTimeBarFill,
                    { 
                      width: `${(item.count / analytics.peakUrgeHours[0].count) * 100}%`,
                      backgroundColor: '#6C5CE7',
                    }
                  ]}
                />
              </View>
              <Text style={[styles.peakTimeCount, { color: subText }]}>
                {item.count}
              </Text>
            </View>
          ))}
        </View>

        {/* Top Triggers */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🎯 Top Triggers
          </Text>
          {analytics.topTriggers.map((trigger, index) => (
            <View key={index} style={styles.triggerItem}>
              <View style={styles.triggerLeft}>
                <Text style={[styles.triggerName, { color: textColor }]}>
                  {trigger.trigger}
                </Text>
                <Text style={[styles.triggerCount, { color: subText }]}>
                  {trigger.count} times
                </Text>
              </View>
              <View style={styles.triggerRight}>
                <Text style={[
                  styles.triggerSuccess,
                  { color: trigger.successRate >= 50 ? '#00E676' : '#FF5252' }
                ]}>
                  {trigger.successRate.toFixed(0)}%
                </Text>
                <Text style={[styles.triggerSuccessLabel, { color: subText }]}>
                  success
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Risk & Protective Factors */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            ⚖️ Risk Assessment
          </Text>
          
          {analytics.riskFactors.length > 0 && (
            <View style={styles.factorsGroup}>
              <Text style={[styles.factorsLabel, { color: '#FF5252' }]}>
                ⚠️ Risk Factors
              </Text>
              {analytics.riskFactors.map((factor, index) => (
                <Text key={index} style={[styles.factorItem, { color: subText }]}>
                  • {factor}
                </Text>
              ))}
            </View>
          )}

          {analytics.protectiveFactors.length > 0 && (
            <View style={styles.factorsGroup}>
              <Text style={[styles.factorsLabel, { color: '#00E676' }]}>
                ✅ Protective Factors
              </Text>
              {analytics.protectiveFactors.map((factor, index) => (
                <Text key={index} style={[styles.factorItem, { color: subText }]}>
                  • {factor}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Recommendations */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🎯 Recommendations
          </Text>
          {analytics.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={[styles.recommendationText, { color: textColor }]}>
                {rec}
              </Text>
            </View>
          ))}
        </View>

        {/* Share Button */}
        {onNavigate && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => onNavigate('socialSharing')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareButtonGradient}
            >
              <Text style={styles.shareButtonText}>📤 Share Your Progress</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 60,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  scoreCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 16,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    marginBottom: 16,
  },
  scoreGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFF',
  },
  scoreSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendEmoji: {
    fontSize: 20,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  comparisonValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  comparisonArrow: {
    paddingHorizontal: 16,
  },
  arrowIcon: {
    fontSize: 24,
  },
  comparisonChange: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  insightCard: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  peakTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  peakTimeRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  peakTimeRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  peakTimeHour: {
    fontSize: 14,
    fontWeight: '600',
    width: 100,
  },
  peakTimeBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  peakTimeBarFill: {
    height: '100%',
  },
  peakTimeCount: {
    fontSize: 14,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(108, 92, 231, 0.1)',
  },
  triggerLeft: {
    flex: 1,
  },
  triggerName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  triggerCount: {
    fontSize: 12,
  },
  triggerRight: {
    alignItems: 'flex-end',
  },
  triggerSuccess: {
    fontSize: 18,
    fontWeight: '700',
  },
  triggerSuccessLabel: {
    fontSize: 11,
  },
  factorsGroup: {
    marginBottom: 16,
  },
  factorsLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  factorItem: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#6C5CE7',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  shareButton: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  shareButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});