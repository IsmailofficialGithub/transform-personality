import React, { useState } from 'react';
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
import { useThemeStore } from '../../store/themeStore';
import { usePremium } from '../../hooks/usePremium';
import { SIZES } from '../../utils/theme';
import { communityData } from './CommunityHub';

const { width } = Dimensions.get('window');

interface GroupChallengesProps {
  onNavigate?: (screen: string) => void;
}

export const GroupChallenges = ({ onNavigate }: GroupChallengesProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const { isPremium } = usePremium();
  const groups = communityData.groups;

  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(
    new Set(groups.filter(g => g.isMember).map(g => g.id))
  );

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  const handleJoinChallenge = (groupId: string, isPremium: boolean) => {
    if (isPremium && !isPremium) {
      onNavigate?.('premium');
      return;
    }
    setJoinedChallenges(new Set([...joinedChallenges, groupId]));
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Group Challenges</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Join challenges and stay accountable with others
          </Text>
        </View>

        {groups.map((group) => {
          const isJoined = joinedChallenges.has(group.id);
          
          return (
            <View
              key={group.id}
              style={[styles.challengeCard, { backgroundColor: cardBg }]}
            >
              <View style={styles.challengeHeader}>
                <View style={[styles.emojiContainer, { backgroundColor: group.color + '20' }]}>
                  <Text style={styles.emoji}>{group.emoji}</Text>
                </View>
                <View style={styles.challengeInfo}>
                  <View style={styles.challengeTitleRow}>
                    <Text style={[styles.challengeName, { color: textColor }]}>
                      {group.name}
                    </Text>
                    {group.isPremium && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.challengeDesc, { color: subText }]} numberOfLines={2}>
                    {group.description}
                  </Text>
                </View>
              </View>

              <View style={styles.challengeStats}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {group.memberCount.toLocaleString()}
                  </Text>
                  <Text style={[styles.statLabel, { color: subText }]}>Members</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {group.postsToday}
                  </Text>
                  <Text style={[styles.statLabel, { color: subText }]}>Posts Today</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.joinButton,
                  isJoined && styles.joinedButton,
                  { backgroundColor: isJoined ? colors.success : group.color }
                ]}
                onPress={() => handleJoinChallenge(group.id, group.isPremium)}
                activeOpacity={0.8}
              >
                <Text style={styles.joinButtonText}>
                  {isJoined ? '✓ Joined' : 'Join Challenge'}
                </Text>
              </TouchableOpacity>
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
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 32,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  challengeDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  stat: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  joinButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinedButton: {
    opacity: 0.7,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

