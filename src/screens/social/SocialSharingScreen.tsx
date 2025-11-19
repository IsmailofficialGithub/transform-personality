import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import { useHabitStore } from '../../store/habitStore';

interface SocialSharingScreenProps {
  onBack: () => void;
}

export const SocialSharingScreen = ({ onBack }: SocialSharingScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const habits = useHabitStore((state) => state.habits);

  const calculateDaysClean = (quitDate: string) => {
    const now = new Date();
    const quit = new Date(quitDate);
    const diffTime = Math.abs(now.getTime() - quit.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalDaysClean = habits.reduce(
    (sum, habit) => sum + calculateDaysClean(habit.quitDate),
    0
  );

  const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);

  const shareOptions = [
    {
      id: 'milestone',
      icon: '🏆',
      title: 'Share Milestone',
      description: 'Share your days clean achievement',
      color: ['#FFD700', '#FFA500'],
      action: () => shareMessage(
        `🎉 I've been clean for ${totalDaysClean} days! Join me on my transformation journey. 💪 #TransformationApp #Recovery`
      ),
    },
    {
      id: 'streak',
      icon: '🔥',
      title: 'Share Streak',
      description: 'Celebrate your longest streak',
      color: ['#FF6B6B', '#FF5252'],
      action: () => shareMessage(
        `🔥 My longest streak: ${longestStreak} days! Every day is a victory. 💯 #StreakMaster #TransformationApp`
      ),
    },
    {
      id: 'motivation',
      icon: '💪',
      title: 'Share Motivation',
      description: 'Inspire others with your story',
      color: ['#667EEA', '#764BA2'],
      action: () => shareMessage(
        `💪 Transforming my life one day at a time! If I can do it, so can you. 🌟 #Transformation #Recovery #NeverGiveUp`
      ),
    },
    {
      id: 'badge',
      icon: '🎖️',
      title: 'Share Achievement',
      description: 'Show off your badges',
      color: ['#00E676', '#00C853'],
      action: () => shareMessage(
        `🎖️ Just unlocked a new achievement in my transformation journey! Feeling proud and motivated. 🚀 #Achievements #TransformationApp`
      ),
    },
  ];

  const shareMessage = async (message: string) => {
    try {
      const result = await Share.share({
        message,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success!', 'Your progress has been shared! 🎉');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share. Please try again.');
      console.error(error);
    }
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
        <Text style={[styles.title, { color: textColor }]}>Social Sharing</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Preview */}
        <View style={[styles.statsPreview, { backgroundColor: cardBg }]}>
          <Text style={[styles.previewTitle, { color: textColor }]}>
            Your Stats
          </Text>
          <View style={styles.previewStats}>
            <View style={styles.previewStat}>
              <Text style={[styles.previewValue, { color: colors.primary }]}>
                {totalDaysClean}
              </Text>
              <Text style={[styles.previewLabel, { color: subText }]}>
                Days Clean
              </Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewStat}>
              <Text style={[styles.previewValue, { color: colors.primary }]}>
                {longestStreak}
              </Text>
              <Text style={[styles.previewLabel, { color: subText }]}>
                Best Streak
              </Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewStat}>
              <Text style={[styles.previewValue, { color: colors.primary }]}>
                {habits.length}
              </Text>
              <Text style={[styles.previewLabel, { color: subText }]}>
                Habits
              </Text>
            </View>
          </View>
        </View>

        {/* Share Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🌐 Share Your Journey
          </Text>
          <Text style={[styles.sectionSubtitle, { color: subText }]}>
            Inspire others by sharing your progress
          </Text>

          {shareOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.shareCard, { backgroundColor: cardBg }]}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <View style={styles.shareLeft}>
                <View style={styles.shareIconContainer}>
                  <LinearGradient
                    colors={option.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.shareIconGradient}
                  >
                    <Text style={styles.shareIcon}>{option.icon}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.shareInfo}>
                  <Text style={[styles.shareTitle, { color: textColor }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.shareDescription, { color: subText }]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              <Text style={[styles.shareArrow, { color: subText }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Platforms */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            📱 Supported Platforms
          </Text>
          <View style={styles.platformsRow}>
            {['📘', '📷', '🐦', '💼', '💬'].map((emoji, index) => (
              <View
                key={index}
                style={[styles.platformCard, { backgroundColor: cardBg }]}
              >
                <Text style={styles.platformEmoji}>{emoji}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.infoIconText}>💡</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: textColor }]}>
              Share Responsibly
            </Text>
            <Text style={[styles.infoText, { color: subText }]}>
              Your journey can inspire others! Share your progress to motivate friends and family on their own transformation paths.
            </Text>
          </View>
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
  statsPreview: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  previewStat: {
    alignItems: 'center',
    flex: 1,
  },
  previewValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  previewDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
  },
  section: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 25,
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
  shareCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  shareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shareIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginRight: 12,
  },
  shareIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 26,
  },
  shareInfo: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  shareDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  shareArrow: {
    fontSize: 24,
    marginLeft: 8,
  },
  platformsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  platformCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformEmoji: {
    fontSize: 32,
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoIconText: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
  },
});