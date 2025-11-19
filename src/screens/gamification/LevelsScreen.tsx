import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabitStore } from '../../store/habitStore';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';

const LEVELS = [
  { level: 1, name: 'Beginner', xpRequired: 0, color: ['#9E9E9E', '#757575'], description: 'Starting your journey' },
  { level: 2, name: 'Warrior', xpRequired: 100, color: ['#4CAF50', '#388E3C'], description: 'Building strength' },
  { level: 3, name: 'Champion', xpRequired: 500, color: ['#2196F3', '#1976D2'], description: 'Making progress' },
  { level: 4, name: 'Master', xpRequired: 1000, color: ['#9C27B0', '#7B1FA2'], description: 'Advanced recovery' },
  { level: 5, name: 'Legend', xpRequired: 5000, color: ['#FFD700', '#FFA500'], description: 'Elite status' },
];

interface LevelsScreenProps {
  onNavigate?: (screen: string) => void;
}

export const LevelsScreen = ({ onNavigate }: LevelsScreenProps) => {
  const habits = useHabitStore((state) => state.habits);
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const { currentXP, currentLevel, nextLevel, progress } = useMemo(() => {
    const totalDays = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const currentXP = totalDays * 10; // 10 XP per day
    
    let levelIndex = 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (currentXP >= LEVELS[i].xpRequired) {
        levelIndex = i;
        break;
      }
    }
    
    const currentLevel = LEVELS[levelIndex];
    const nextLevel = LEVELS[levelIndex + 1];
    const progress = nextLevel 
      ? ((currentXP - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
      : 100;

    return { currentXP, currentLevel, nextLevel, progress };
  }, [habits]);

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
          <Text style={[styles.title, { color: textColor }]}>Your Level</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Progress through ranks as you stay strong
          </Text>
        </View>

        {/* Current Level Card */}
        <View style={[styles.levelCard, { backgroundColor: cardBg }]}>
          <LinearGradient
            colors={currentLevel.color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelBadge}
          >
            <Text style={styles.levelNumber}>{currentLevel.level}</Text>
            <Text style={styles.levelName}>{currentLevel.name}</Text>
          </LinearGradient>
          
          <Text style={[styles.xpText, { color: textColor }]}>
            {currentXP.toLocaleString()} XP
          </Text>
          <Text style={[styles.levelDescription, { color: subText }]}>
            {currentLevel.description}
          </Text>

          {nextLevel && (
            <>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <LinearGradient
                    colors={nextLevel.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
                  />
                </View>
                <Text style={[styles.progressText, { color: subText }]}>
                  {Math.round(progress)}% to next level
                </Text>
              </View>
              
              <View style={styles.nextLevelInfo}>
                <Text style={[styles.nextLevelLabel, { color: subText }]}>
                  Next: {nextLevel.name}
                </Text>
                <Text style={[styles.nextLevelXP, { color: colors.primary }]}>
                  {nextLevel.xpRequired - currentXP} XP needed
                </Text>
              </View>
            </>
          )}

          {!nextLevel && (
            <View style={styles.maxLevel}>
              <Text style={[styles.maxLevelText, { color: colors.primary }]}>
                🏆 Maximum Level Achieved!
              </Text>
            </View>
          )}
        </View>

        {/* All Levels List */}
        <View style={styles.levelsList}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            All Levels
          </Text>
          {LEVELS.map((level, index) => {
            const isUnlocked = currentXP >= level.xpRequired;
            const isCurrent = level.level === currentLevel.level;
            
            return (
              <View
                key={level.level}
                style={[
                  styles.levelItem,
                  { backgroundColor: cardBg },
                  isCurrent && styles.currentLevelItem,
                ]}
              >
                <View style={styles.levelItemLeft}>
                  <View
                    style={[
                      styles.levelItemBadge,
                      { backgroundColor: isUnlocked ? level.color[0] : 'rgba(0,0,0,0.1)' },
                    ]}
                  >
                    <Text style={[
                      styles.levelItemNumber,
                      { color: isUnlocked ? '#FFF' : subText }
                    ]}>
                      {level.level}
                    </Text>
                  </View>
                  <View style={styles.levelItemInfo}>
                    <Text style={[
                      styles.levelItemName,
                      { color: isUnlocked ? textColor : subText }
                    ]}>
                      {level.name}
                      {isCurrent && ' (Current)'}
                    </Text>
                    <Text style={[styles.levelItemDesc, { color: subText }]}>
                      {level.description}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.levelItemXP, { color: subText }]}>
                  {level.xpRequired.toLocaleString()} XP
                </Text>
              </View>
            );
          })}
        </View>

        {/* XP Sources */}
        <View style={[styles.xpSourcesCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            How to Earn XP
          </Text>
          <View style={styles.xpSourceItem}>
            <Text style={styles.xpSourceIcon}>📅</Text>
            <View style={styles.xpSourceInfo}>
              <Text style={[styles.xpSourceName, { color: textColor }]}>
                Daily Streak
              </Text>
              <Text style={[styles.xpSourceValue, { color: colors.primary }]}>
                +10 XP per day
              </Text>
            </View>
          </View>
          <View style={styles.xpSourceItem}>
            <Text style={styles.xpSourceIcon}>🎮</Text>
            <View style={styles.xpSourceInfo}>
              <Text style={[styles.xpSourceName, { color: textColor }]}>
                Play Games
              </Text>
              <Text style={[styles.xpSourceValue, { color: colors.primary }]}>
                +5 XP per game
              </Text>
            </View>
          </View>
          <View style={styles.xpSourceItem}>
            <Text style={styles.xpSourceIcon}>🏆</Text>
            <View style={styles.xpSourceInfo}>
              <Text style={[styles.xpSourceName, { color: textColor }]}>
                Achievements
              </Text>
              <Text style={[styles.xpSourceValue, { color: colors.primary }]}>
                +50 XP per achievement
              </Text>
            </View>
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
  levelCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFF',
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 4,
  },
  xpText: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  nextLevelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  nextLevelLabel: {
    fontSize: 14,
  },
  nextLevelXP: {
    fontSize: 14,
    fontWeight: '600',
  },
  maxLevel: {
    marginTop: 12,
  },
  maxLevelText: {
    fontSize: 18,
    fontWeight: '700',
  },
  levelsList: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  currentLevelItem: {
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  levelItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelItemBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelItemNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  levelItemInfo: {
    flex: 1,
  },
  levelItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  levelItemDesc: {
    fontSize: 12,
  },
  levelItemXP: {
    fontSize: 14,
    fontWeight: '600',
  },
  xpSourcesCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  xpSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  xpSourceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  xpSourceInfo: {
    flex: 1,
  },
  xpSourceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  xpSourceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

