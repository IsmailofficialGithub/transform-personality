import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import { useHabitStore } from '../../store/habitStore';
import AIAnalysisService from '../../services/AIAnalysisService';

const { width } = Dimensions.get('window');

interface AIAnalysisScreenProps {
  habitId: string;
}

export const AIAnalysisScreen = ({ habitId }: AIAnalysisScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [habitId]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const result = await AIAnalysisService.analyzeHabitData(habitId);
      setAnalysis(result);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: number): string => {
    if (risk >= 70) return '#FF5252';
    if (risk >= 40) return '#FF9800';
    return '#00E676';
  };

  const getRiskLabel = (risk: number): string => {
    if (risk >= 70) return 'High Risk';
    if (risk >= 40) return 'Moderate Risk';
    return 'Low Risk';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Analyzing your data...
          </Text>
        </View>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Unable to load analysis
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={colors.gradientPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerEmoji}>🤖</Text>
          <Text style={styles.headerTitle}>AI Analysis</Text>
          <Text style={styles.headerSubtitle}>
            Personalized insights powered by AI
          </Text>
        </LinearGradient>

        {/* Risk Score */}
        <View style={[styles.riskCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.riskLabel, { color: colors.text }]}>
            Current Risk Level
          </Text>
          <View style={styles.riskMeter}>
            <View style={[styles.riskMeterBg, { backgroundColor: colors.border }]}>
              <LinearGradient
                colors={[getRiskColor(analysis.riskScore), getRiskColor(analysis.riskScore)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.riskMeterFill, { width: `${analysis.riskScore}%` }]}
              />
            </View>
            <View style={styles.riskInfo}>
              <Text style={[styles.riskScore, { color: getRiskColor(analysis.riskScore) }]}>
                {analysis.riskScore}%
              </Text>
              <Text style={[styles.riskText, { color: colors.textSecondary }]}>
                {getRiskLabel(analysis.riskScore)}
              </Text>
            </View>
          </View>
        </View>

        {/* Key Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            💡 Key Insights
          </Text>
          {analysis.insights.map((insight: string, index: number) => (
            <View key={index} style={[styles.insightCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.insightText, { color: colors.text }]}>
                {insight}
              </Text>
            </View>
          ))}
        </View>

        {/* Patterns */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📊 Detected Patterns
          </Text>
          
          <View style={[styles.patternCard, { backgroundColor: colors.surface }]}>
            <View style={styles.patternRow}>
              <View style={styles.patternItem}>
                <Text style={styles.patternIcon}>⏰</Text>
                <Text style={[styles.patternLabel, { color: colors.textSecondary }]}>
                  Peak Time
                </Text>
                <Text style={[styles.patternValue, { color: colors.text }]}>
                  {analysis.patterns.peakUrgeTime}
                </Text>
              </View>
              
              <View style={styles.patternItem}>
                <Text style={styles.patternIcon}>📈</Text>
                <Text style={[styles.patternLabel, { color: colors.textSecondary }]}>
                  Success Rate
                </Text>
                <Text style={[styles.patternValue, { color: colors.success }]}>
                  {analysis.patterns.successRate}%
                </Text>
              </View>
            </View>

            {analysis.patterns.commonTriggers.length > 0 && (
              <View style={styles.triggersSection}>
                <Text style={[styles.triggersTitle, { color: colors.text }]}>
                  🎯 Common Triggers
                </Text>
                {analysis.patterns.commonTriggers.map((trigger: string, index: number) => (
                  <View key={index} style={styles.triggerTag}>
                    <Text style={[styles.triggerText, { color: colors.primary }]}>
                      {trigger}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.trendContainer}>
              <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>
                Trend:
              </Text>
              <View style={[
                styles.trendBadge,
                { backgroundColor: getTrendColor(analysis.patterns.streakTrend) }
              ]}>
                <Text style={styles.trendText}>
                  {getTrendEmoji(analysis.patterns.streakTrend)} {getTrendLabel(analysis.patterns.streakTrend)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Prediction */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🔮 Prediction
          </Text>
          
          <View style={[styles.predictionCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.predictionTitle, { color: colors.text }]}>
              Next Urge Risk
            </Text>
            <View style={[
              styles.predictionBadge,
              { backgroundColor: getPredictionColor(analysis.prediction.nextUrgeRisk) }
            ]}>
              <Text style={styles.predictionRisk}>
                {analysis.prediction.nextUrgeRisk.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.predictionTime, { color: colors.textSecondary }]}>
              Estimated: {analysis.prediction.estimatedTime}
            </Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            💪 Recommendations
          </Text>
          {analysis.recommendations.map((rec: string, index: number) => (
            <View key={index} style={[styles.recommendationCard, { backgroundColor: colors.surface }]}>
              <View style={styles.recommendationNumber}>
                <Text style={styles.recommendationNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.recommendationText, { color: colors.text }]}>
                {rec}
              </Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.surface }]}>
          <Text style={styles.disclaimerIcon}>ℹ️</Text>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            This analysis is based on your logged data and patterns. Results improve with more data over time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const getTrendColor = (trend: string): string => {
  if (trend === 'improving') return 'rgba(0, 230, 118, 0.2)';
  if (trend === 'declining') return 'rgba(255, 82, 82, 0.2)';
  return 'rgba(255, 152, 0, 0.2)';
};

const getTrendEmoji = (trend: string): string => {
  if (trend === 'improving') return '📈';
  if (trend === 'declining') return '📉';
  return '➡️';
};

const getTrendLabel = (trend: string): string => {
  if (trend === 'improving') return 'Improving';
  if (trend === 'declining') return 'Needs Attention';
  return 'Stable';
};

const getPredictionColor = (risk: string): string => {
  if (risk === 'high') return 'rgba(255, 82, 82, 0.2)';
  if (risk === 'medium') return 'rgba(255, 152, 0, 0.2)';
  return 'rgba(0, 230, 118, 0.2)';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.body,
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    fontSize: SIZES.body,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    padding: SIZES.paddingLarge,
    paddingTop: SIZES.paddingLarge + 20,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: SIZES.margin,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255,255,255,0.9)',
  },
  riskCard: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.marginLarge,
    padding: SIZES.padding,
    borderRadius: SIZES.radiusLarge,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  riskLabel: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
  },
  riskMeter: {
    marginBottom: SIZES.margin,
  },
  riskMeterBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SIZES.marginSmall,
  },
  riskMeterFill: {
    height: '100%',
  },
  riskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riskScore: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
  },
  riskText: {
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  section: {
    marginTop: SIZES.marginLarge,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
  },
  insightCard: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.marginSmall,
    borderLeftWidth: 4,
    borderLeftColor: '#6C5CE7',
  },
  insightText: {
    fontSize: SIZES.body,
    lineHeight: 22,
  },
  patternCard: {
    padding: SIZES.padding,
    borderRadius: SIZES.radiusLarge,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  patternRow: {
    flexDirection: 'row',
    marginBottom: SIZES.marginLarge,
  },
  patternItem: {
    flex: 1,
    alignItems: 'center',
  },
  patternIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  patternLabel: {
    fontSize: SIZES.small,
    marginBottom: 4,
  },
  patternValue: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
  },
  triggersSection: {
    marginTop: SIZES.margin,
    paddingTop: SIZES.margin,
    borderTopWidth: 1,
    borderTopColor: 'rgba(108, 92, 231, 0.2)',
  },
  triggersTitle: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    marginBottom: SIZES.marginSmall,
  },
  triggerTag: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  triggerText: {
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.margin,
    paddingTop: SIZES.margin,
    borderTopWidth: 1,
    borderTopColor: 'rgba(108, 92, 231, 0.2)',
  },
  trendLabel: {
    fontSize: SIZES.body,
  },
  trendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  predictionCard: {
    padding: SIZES.paddingLarge,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  predictionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
  },
  predictionBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: SIZES.marginSmall,
  },
  predictionRisk: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: '#FFF',
  },
  predictionTime: {
    fontSize: SIZES.body,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.marginSmall,
  },
  recommendationNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin,
  },
  recommendationNumberText: {
    color: '#FFF',
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  recommendationText: {
    flex: 1,
    fontSize: SIZES.body,
    lineHeight: 22,
  },
  disclaimer: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.marginLarge,
    flexDirection: 'row',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  disclaimerIcon: {
    fontSize: 24,
    marginRight: SIZES.margin,
  },
  disclaimerText: {
    flex: 1,
    fontSize: SIZES.small,
    lineHeight: 20,
  },
});