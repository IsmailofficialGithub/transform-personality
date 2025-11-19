import React, { useEffect } from 'react';
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
import { useTrackingStore } from '../../store/trackingStore';

const { width } = Dimensions.get('window');

interface TrackingDashboardProps {
  onBack: () => void;
}

export const TrackingDashboard = ({ onBack }: TrackingDashboardProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  
  const usageStats = useTrackingStore((state) => state.usageStats);
  const gameSessions = useTrackingStore((state) => state.gameSessions);
  const getGameStats = useTrackingStore((state) => state.getGameStats);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  // Top games by playtime
  const gameIds = ['memory-match', 'breath-pacer', 'reaction-time', 'urge-fighter', 'focus-master'];
  const topGames = gameIds
    .map(id => ({ id, ...getGameStats(id) }))
    .filter(game => game.played > 0)
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 5);

  // Top features used
  const topFeatures = Object.entries(usageStats.featuresUsed)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Top screens viewed
  const topScreens = Object.entries(usageStats.screenViews)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Tracking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Usage Stats */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            📱 App Usage
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {usageStats.totalSessions}
              </Text>
              <Text style={[styles.statLabel, { color: subText }]}>
                Total Sessions
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatTime(usageStats.totalTimeSpent)}
              </Text>
              <Text style={[styles.statLabel, { color: subText }]}>
                Time Spent
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatTime(usageStats.averageSessionLength)}
              </Text>
              <Text style={[styles.statLabel, { color: subText }]}>
                Avg Session
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {usageStats.daysActive}
              </Text>
              <Text style={[styles.statLabel, { color: subText }]}>
                Days Active
              </Text>
            </View>
          </View>
        </View>

        {/* Game Stats */}
        {topGames.length > 0 && (
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              🎮 Games Played
            </Text>

            {topGames.map((game, index) => (
              <View key={game.id} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <View style={[styles.rank, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.rankText, { color: colors.primary }]}>
                      #{index + 1}
                    </Text>
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={[styles.listItemTitle, { color: textColor }]}>
                      {game.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                    <Text style={[styles.listItemSubtitle, { color: subText }]}>
                      {game.played} sessions • {formatTime(game.totalTime)}
                    </Text>
                  </View>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={[styles.scoreText, { color: colors.primary }]}>
                    {Math.round(game.avgScore)}
                  </Text>
                  <Text style={[styles.scoreLabel, { color: subText }]}>
                    avg score
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Features */}
        {topFeatures.length > 0 && (
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              ⭐ Top Features
            </Text>

            {topFeatures.map(([feature, count], index) => (
              <View key={feature} style={styles.featureItem}>
                <Text style={[styles.featureName, { color: textColor }]}>
                  {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <View style={styles.featureBar}>
                  <View 
                    style={[
                      styles.featureBarFill,
                      { 
                        width: `${(count / topFeatures[0][1]) * 100}%`,
                        backgroundColor: colors.primary,
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.featureCount, { color: subText }]}>
                  {count}x
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Top Screens */}
        {topScreens.length > 0 && (
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              📺 Most Viewed Screens
            </Text>

            {topScreens.map(([screen, count], index) => (
              <View key={screen} style={styles.screenItem}>
                <View style={styles.screenLeft}>
                  <View style={[styles.screenRank, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.screenRankText, { color: colors.primary }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[styles.screenName, { color: textColor }]}>
                    {screen.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                </View>
                <Text style={[styles.screenCount, { color: colors.primary }]}>
                  {count}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Sessions */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🕐 Recent Game Sessions
          </Text>

          {gameSessions.slice(-5).reverse().map((session) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionLeft}>
                <Text style={[styles.sessionGame, { color: textColor }]}>
                  {session.gameName}
                </Text>
                <Text style={[styles.sessionTime, { color: subText }]}>
                  {new Date(session.timestamp).toLocaleDateString()} • {formatTime(session.duration)}
                </Text>
              </View>
              <View style={styles.sessionRight}>
                <Text style={[styles.sessionScore, { color: session.completed ? '#00E676' : '#FF9800' }]}>
                  {session.score}
                </Text>
                <Text style={[styles.sessionStatus, { color: subText }]}>
                  {session.completed ? '✓' : '—'}
                </Text>
              </View>
            </View>
          ))}

          {gameSessions.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: subText }]}>
                No game sessions yet. Start playing to see your stats!
              </Text>
            </View>
          )}
        </View>

        {/* Privacy Note */}
        <View style={[styles.privacyCard, { backgroundColor: cardBg }]}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <View style={styles.privacyContent}>
            <Text style={[styles.privacyTitle, { color: textColor }]}>
              Privacy & Data
            </Text>
            <Text style={[styles.privacyText, { color: subText }]}>
              All tracking data is stored locally on your device. We never share your usage data with third parties.
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
    paddingBottom: 40,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: (width - SIZES.padding * 2 - 32 - 12) / 2,
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(108, 92, 231, 0.1)',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 12,
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    width: 120,
  },
  featureBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  featureBarFill: {
    height: '100%',
  },
  featureCount: {
    fontSize: 12,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  screenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  screenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  screenRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  screenRankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  screenName: {
    fontSize: 14,
    fontWeight: '600',
  },
  screenCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(108, 92, 231, 0.1)',
  },
  sessionLeft: {
    flex: 1,
  },
  sessionGame: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 12,
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  sessionScore: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  sessionStatus: {
    fontSize: 12,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  privacyCard: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
  },
  privacyIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 20,
  },
});