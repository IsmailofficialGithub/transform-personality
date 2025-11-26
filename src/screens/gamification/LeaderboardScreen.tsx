import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';
import { Flame, Star, Medal } from 'lucide-react-native';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  streak: number;
  xp: number;
  isCurrentUser: boolean;
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { id: '1', rank: 1, name: 'Champion2024', streak: 365, xp: 3650, isCurrentUser: false },
  { id: '2', rank: 2, name: 'WarriorKing', streak: 180, xp: 1800, isCurrentUser: false },
  { id: '3', rank: 3, name: 'You', streak: 45, xp: 450, isCurrentUser: true },
  { id: '4', rank: 4, name: 'RecoveryHero', streak: 30, xp: 300, isCurrentUser: false },
  { id: '5', rank: 5, name: 'StrongMind', streak: 21, xp: 210, isCurrentUser: false },
];

export const LeaderboardScreen = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const [activeTab, setActiveTab] = useState<'streak' | 'xp'>('streak');

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return ['#FFD700', '#FFA500'];
      case 2: return ['#C0C0C0', '#A0A0A0'];
      case 3: return ['#CD7F32', '#A0522D'];
      default: return ['#6C5CE7', '#5A4FCF'];
    }
  };

  const renderRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Medal size={40} color="#FFF" />;
      case 2: return <Medal size={40} color="#FFF" />;
      case 3: return <Medal size={40} color="#FFF" />;
      default: return <Text style={styles.rankText}>#{rank}</Text>;
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
          <Text style={[styles.title, { color: textColor }]}>Leaderboard</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            See how you rank against others
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'streak' && styles.activeTab,
              { backgroundColor: activeTab === 'streak' ? colors.primary : cardBg }
            ]}
            onPress={() => setActiveTab('streak')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={16} color={activeTab === 'streak' ? '#FFF' : textColor} style={{ marginRight: 6 }} />
              <Text style={[
                styles.tabText,
                { color: activeTab === 'streak' ? '#FFF' : textColor }
              ]}>
                Streak
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'xp' && styles.activeTab,
              { backgroundColor: activeTab === 'xp' ? colors.primary : cardBg }
            ]}
            onPress={() => setActiveTab('xp')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={16} color={activeTab === 'xp' ? '#FFF' : textColor} style={{ marginRight: 6 }} />
              <Text style={[
                styles.tabText,
                { color: activeTab === 'xp' ? '#FFF' : textColor }
              ]}>
                XP
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Top 3 Podium */}
        <View style={styles.podium}>
          {LEADERBOARD_DATA.slice(0, 3).map((entry, index) => {
            const positions = [1, 0, 2]; // Center, Left, Right
            const position = positions[index];

            return (
              <View
                key={entry.id}
                style={[
                  styles.podiumItem,
                  position === 0 && styles.podiumCenter,
                  position === 1 && styles.podiumLeft,
                  position === 2 && styles.podiumRight,
                ]}
              >
                <LinearGradient
                  colors={getRankColor(entry.rank)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.podiumBadge}
                >
                  {renderRankIcon(entry.rank)}
                </LinearGradient>
                <Text style={[styles.podiumName, { color: textColor }]} numberOfLines={1}>
                  {entry.name}
                </Text>
                <Text style={[styles.podiumValue, { color: colors.primary }]}>
                  {activeTab === 'streak' ? `${entry.streak}d` : `${entry.xp} XP`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Rest of Leaderboard */}
        <View style={styles.leaderboardList}>
          {LEADERBOARD_DATA.slice(3).map((entry) => (
            <View
              key={entry.id}
              style={[
                styles.leaderboardItem,
                { backgroundColor: cardBg },
                entry.isCurrentUser && styles.currentUserItem,
              ]}
            >
              <View style={styles.rankContainer}>
                <Text style={[styles.rankNumber, { color: subText }]}>
                  {entry.rank}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: textColor }]}>
                  {entry.name}
                  {entry.isCurrentUser && ' (You)'}
                </Text>
                <Text style={[styles.userStats, { color: subText }]}>
                  {activeTab === 'streak'
                    ? `${entry.streak} day streak`
                    : `${entry.xp} XP`}
                </Text>
              </View>
              <View style={styles.valueContainer}>
                <Text style={[styles.valueText, { color: colors.primary }]}>
                  {activeTab === 'streak' ? entry.streak : entry.xp}
                </Text>
              </View>
            </View>
          ))}
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.padding,
    marginBottom: 32,
    height: 200,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumCenter: {
    marginHorizontal: 8,
  },
  podiumLeft: {
    marginRight: 4,
  },
  podiumRight: {
    marginLeft: 4,
  },
  podiumBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  podiumValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  leaderboardList: {
    paddingHorizontal: SIZES.padding,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userStats: {
    fontSize: 12,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
