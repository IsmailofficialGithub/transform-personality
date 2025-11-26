import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';
import { Flame, Gamepad2, ClipboardList, Swords } from 'lucide-react-native';

const IconMap: Record<string, any> = {
  Flame,
  Gamepad2,
  ClipboardList,
  Swords,
};

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  xpReward: number;
  icon: string;
  color: string[];
  progress: number;
  target: number;
  completed: boolean;
}

const CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: '7-Day Streak',
    description: 'Maintain your streak for 7 consecutive days',
    type: 'weekly',
    xpReward: 100,
    icon: 'Flame',
    color: ['#FF6B6B', '#FF8E53'],
    progress: 3,
    target: 7,
    completed: false,
  },
  {
    id: '2',
    title: 'Play 3 Games',
    description: 'Play any 3 games to distract from urges',
    type: 'daily',
    xpReward: 50,
    icon: 'Gamepad2',
    color: ['#667EEA', '#764BA2'],
    progress: 1,
    target: 3,
    completed: false,
  },
  {
    id: '3',
    title: 'Log 5 Urges',
    description: 'Track 5 urges this week',
    type: 'weekly',
    xpReward: 75,
    icon: 'ClipboardList',
    color: ['#00E676', '#00C853'],
    progress: 2,
    target: 5,
    completed: false,
  },
  {
    id: '4',
    title: '30-Day Warrior',
    description: 'Reach 30 days clean',
    type: 'special',
    xpReward: 500,
    icon: 'Swords',
    color: ['#FFD700', '#FFA500'],
    progress: 12,
    target: 30,
    completed: false,
  },
];

export const ChallengesScreen = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const [challenges, setChallenges] = useState(CHALLENGES);

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'special': return 'Special';
      default: return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Challenges</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Complete challenges to earn XP and rewards
          </Text>
        </View>

        {challenges.map((challenge) => {
          const progressPercent = (challenge.progress / challenge.target) * 100;
          const Icon = IconMap[challenge.icon] || Flame;

          return (
            <View
              key={challenge.id}
              style={[styles.challengeCard, { backgroundColor: cardBg }]}
            >
              <View style={styles.challengeHeader}>
                <View style={[styles.iconContainer, { backgroundColor: challenge.color[0] + '20' }]}>
                  <Icon size={28} color={challenge.color[0]} />
                </View>
                <View style={styles.challengeInfo}>
                  <View style={styles.challengeTitleRow}>
                    <Text style={[styles.challengeTitle, { color: textColor }]}>
                      {challenge.title}
                    </Text>
                    <View style={[styles.typeBadge, { backgroundColor: challenge.color[0] + '30' }]}>
                      <Text style={[styles.typeText, { color: challenge.color[0] }]}>
                        {getTypeLabel(challenge.type)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.challengeDesc, { color: subText }]}>
                    {challenge.description}
                  </Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressText, { color: textColor }]}>
                    {challenge.progress} / {challenge.target}
                  </Text>
                  <Text style={[styles.xpReward, { color: colors.primary }]}>
                    +{challenge.xpReward} XP
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <LinearGradient
                    colors={challenge.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progressPercent}%` }]}
                  />
                </View>
              </View>

              {challenge.completed && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓ Completed</Text>
                </View>
              )}
            </View>
          );
        })}
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
  challengeCard: {
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
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  challengeDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  xpReward: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  completedBadge: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#00E67620',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00E676',
  },
});
