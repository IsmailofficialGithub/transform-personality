import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import { GAMES, Game } from '../../utils/games';

const { width } = Dimensions.get('window');

interface GamesHubScreenProps {
  onNavigate: (screen: string) => void;
  isPremium: boolean;
}

export const GamesHubScreen = ({ onNavigate, isPremium }: GamesHubScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGamePress = (game: Game) => {
    // Navigate directly to the game screen - premium removed
    onNavigate(game.id);
  };

  const getDifficultyColor = (difficulty: string): string => {
    if (difficulty === 'easy') return '#00E676';
    if (difficulty === 'medium') return '#FF9800';
    return '#FF5252';
  };

  const getCategoryEmoji = (category: string): string => {
    switch (category) {
      case 'puzzle': return '🧩';
      case 'reflex': return '⚡';
      case 'memory': return '🧠';
      case 'strategy': return '♟️';
      default: return '🎮';
    }
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  // PREMIUM LOGIC COMMENTED OUT - All features are now free
  // const freeGames = GAMES.filter(g => !g.isPremium);
  // const premiumGames = GAMES.filter(g => g.isPremium);
  const allGames = GAMES; // Show all games - no premium restrictions

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Games Hub
          </Text>
          <Text style={[styles.headerSubtitle, { color: subText }]}>
            Play games to distract from urges and build focus
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {allGames.length}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>
              Total Games
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {GAMES.length}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>
              Total Games
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>
              4
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>
              Categories
            </Text>
          </View>
        </View>

        {/* Why Games Section */}
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <Text style={styles.infoIcon}>🎮</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: textColor }]}>
              Why Play Games?
            </Text>
            <Text style={[styles.infoText, { color: subText }]}>
              Games redirect your attention, release healthy dopamine, and build mental strength. They're proven to reduce urge intensity by up to 70%.
            </Text>
          </View>
        </View>

        {/* All Games Section - PREMIUM LOGIC COMMENTED OUT */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🎮 All Games
          </Text>

          {allGames.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { backgroundColor: cardBg }]}
              onPress={() => handleGamePress(game)}
              activeOpacity={0.7}
            >
              <View style={styles.gameHeader}>
                <View style={styles.gameIconContainer}>
                  <Text style={styles.gameIcon}>{game.icon}</Text>
                </View>
                <View style={styles.gameInfo}>
                  <Text style={[styles.gameTitle, { color: textColor }]}>
                    {game.title}
                  </Text>
                  <Text style={[styles.gameDescription, { color: subText }]} numberOfLines={2}>
                    {game.description}
                  </Text>
                </View>
              </View>

              <View style={styles.gameMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>{getCategoryEmoji(game.category)}</Text>
                  <Text style={[styles.metaText, { color: subText }]}>
                    {game.category}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>⏱️</Text>
                  <Text style={[styles.metaText, { color: subText }]}>
                    {game.estimatedTime}
                  </Text>
                </View>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(game.difficulty) + '20' }
                ]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(game.difficulty) }]}>
                    {game.difficulty}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* PREMIUM GAMES SECTION COMMENTED OUT - All games shown above */}
        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🎮 All Games
          </Text>

          {premiumGames.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { backgroundColor: cardBg }]}
              onPress={() => handleGamePress(game)}
              activeOpacity={0.7}
            >
              <View style={styles.gameHeader}>
                <View style={styles.gameIconContainer}>
                  <Text style={styles.gameIcon}>{game.icon}</Text>
                </View>
                <View style={styles.gameInfo}>
                  <Text style={[styles.gameTitle, { color: textColor }]}>
                    {game.title}
                  </Text>
                  <Text style={[styles.gameDescription, { color: subText }]} numberOfLines={2}>
                    {game.description}
                  </Text>
                </View>
              </View>

              <View style={styles.gameMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>{getCategoryEmoji(game.category)}</Text>
                  <Text style={[styles.metaText, { color: subText }]}>
                    {game.category}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>⏱️</Text>
                  <Text style={[styles.metaText, { color: subText }]}>
                    {game.estimatedTime}
                  </Text>
                </View>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(game.difficulty) + '20' }
                ]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(game.difficulty) }]}>
                    {game.difficulty}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Benefits Section */}
        <View style={[styles.benefitsCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.benefitsTitle, { color: textColor }]}>
            🌟 Game Benefits
          </Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={[styles.benefitText, { color: textColor }]}>
              Redirects attention away from urges
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={[styles.benefitText, { color: textColor }]}>
              Releases healthy dopamine naturally
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={[styles.benefitText, { color: textColor }]}>
              Builds cognitive strength and focus
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={[styles.benefitText, { color: textColor }]}>
              Proven to reduce urge intensity
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    paddingHorizontal: SIZES.padding,
    marginTop: 40,
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: SIZES.small,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    paddingHorizontal: SIZES.padding,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 25,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  upgradeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  upgradeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  gameCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lockedCard: {
    opacity: 0.7,
  },
  gameHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gameIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lockedIconContainer: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
  },
  gameIcon: {
    fontSize: 32,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  gameDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  gameMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  benefitsCard: {
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitBullet: {
    fontSize: 18,
    color: '#6C5CE7',
    marginRight: 10,
    marginTop: -2,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});