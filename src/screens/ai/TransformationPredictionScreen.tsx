import React, { useState, useEffect } from 'react';
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
import AIPhotoAnalysisService, { TransformationPrediction } from '../../services/AIPhotoAnalysisService';

const { width } = Dimensions.get('window');

interface TransformationPredictionScreenProps {
  onBack: () => void;
}

export const TransformationPredictionScreen = ({ onBack }: TransformationPredictionScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const habits = useHabitStore((state) => state.habits);

  const [prediction, setPrediction] = useState<TransformationPrediction | null>(null);
  const [currentDays, setCurrentDays] = useState(0);

  useEffect(() => {
    loadPrediction();
  }, []);

  const loadPrediction = async () => {
    const days = habits.reduce((sum, h) => {
      const now = new Date();
      const quit = new Date(h.quitDate);
      const daysClean = Math.floor((now.getTime() - quit.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysClean;
    }, 0);

    setCurrentDays(days);
    const pred = await AIPhotoAnalysisService.predictTransformation(days);
    setPrediction(pred);
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Predictions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Progress */}
        <View style={[styles.currentCard, { backgroundColor: cardBg }]}>
          <Text style={styles.currentEmoji}>🎯</Text>
          <Text style={[styles.currentTitle, { color: textColor }]}>
            Your Current Progress
          </Text>
          <Text style={[styles.currentDays, { color: colors.primary }]}>
            Day {currentDays}
          </Text>
          <Text style={[styles.currentSubtext, { color: subText }]}>
            Keep going! Every day compounds your results
          </Text>
        </View>

        {/* Timeline */}
        {prediction?.expectedChanges.map((change, index) => {
          const isPast = currentDays >= change.weeks * 7;
          const isCurrent = 
            currentDays >= change.weeks * 7 && 
            currentDays < (prediction.expectedChanges[index + 1]?.weeks || 999) * 7;

          return (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.timelineDot,
                  { 
                    backgroundColor: isPast ? '#00E676' : isCurrent ? colors.primary : colors.border 
                  }
                ]} />
                {index < prediction.expectedChanges.length - 1 && (
                  <View style={[
                    styles.timelineLine,
                    { backgroundColor: isPast ? '#00E676' : colors.border }
                  ]} />
                )}
              </View>

              <View style={[
                styles.timelineCard,
                { backgroundColor: cardBg },
                isCurrent && styles.currentTimelineCard,
              ]}>
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                  </View>
                )}
                
                <View style={styles.timelineHeader}>
                  <Text style={[styles.timelineWeek, { color: textColor }]}>
                    Week {change.weeks}
                  </Text>
                  {isPast && (
                    <Text style={styles.completedBadge}>✓</Text>
                  )}
                </View>

                {change.improvements.map((improvement, idx) => (
                  <View key={idx} style={styles.improvementItem}>
                    <Text style={styles.improvementBullet}>
                      {isPast ? '✓' : '○'}
                    </Text>
                    <Text style={[
                      styles.improvementText,
                      { 
                        color: isPast ? colors.success : textColor,
                        opacity: isPast ? 1 : 0.7,
                      }
                    ]}>
                      {improvement}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            💡 Motivational Insights
          </Text>
          {prediction?.motivationalInsights.map((insight, index) => (
            <View key={index} style={[styles.insightCard, { backgroundColor: cardBg }]}>
              <LinearGradient
                colors={colors.gradientPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.insightGradient}
              >
                <Text style={styles.insightText}>{insight}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Warnings */}
        {prediction?.healthWarnings && prediction.healthWarnings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              ⚠️ Important Notes
            </Text>
            {prediction.healthWarnings.map((warning, index) => (
              <View key={index} style={[styles.warningCard, { backgroundColor: cardBg }]}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={[styles.warningText, { color: textColor }]}>
                  {warning}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <View style={[styles.ctaCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.ctaTitle, { color: textColor }]}>
            🚀 Accelerate Your Transformation
          </Text>
          <Text style={[styles.ctaText, { color: subText }]}>
            Upload progress photos regularly to track your transformation with AI precision
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
    paddingBottom: 100,
  },
  currentCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  currentEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  currentTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  currentDays: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  currentSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  timelineCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  currentTimelineCard: {
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineWeek: {
    fontSize: 16,
    fontWeight: '700',
  },
  completedBadge: {
    fontSize: 20,
    color: '#00E676',
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  improvementBullet: {
    fontSize: 14,
    marginRight: 8,
    color: '#00E676',
    fontWeight: '700',
  },
  improvementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  insightCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  insightGradient: {
    padding: 16,
  },
  insightText: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  ctaCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});